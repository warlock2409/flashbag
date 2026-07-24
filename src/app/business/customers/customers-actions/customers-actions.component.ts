import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe, NgClass, NgFor } from '@angular/common';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { ElementRef, ViewChild } from '@angular/core';
import { toBlob } from 'html-to-image';
import Swal from 'sweetalert2';
import { MatButtonModule } from '@angular/material/button';
import { environment } from 'src/environments/environment';
import { CustomerProfileService } from 'src/app/services/customer-profile.service';
import { CustomerProfile } from 'src/app/models/customer-profile.model';

@Component({
  selector: 'app-customers-actions',
  imports: [CurrencyPipe, DatePipe, NgClass, NgFor, DecimalPipe, CommonModule, MatButtonModule],
  templateUrl: './customers-actions.component.html',
  styleUrl: './customers-actions.component.scss'
})
export class CustomersActionsComponent {
  closeDialog(): void { this.dialogRef.close(); }
  isExpired(expiryDate: string | Date): boolean {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    // Compare only date (not time)
    return expiry.getTime() < now.getTime();
  }

  readonly customer = inject<any>(MAT_DIALOG_DATA);
  orgService = inject(OrganizationServiceService);
  customerProfileService = inject(CustomerProfileService);
  /** Play Store link shown when weight/height are missing. */
  readonly appDownloadUrl = environment.appDownloadUrl;
  /** Most recent weight (kg) and height (cm) from the customer's profile. */
  latestWeight: number | null = null;
  latestHeight: number | null = null;
  /** Earliest recorded weight (kg), used for the start-to-latest change. */
  startWeight: number | null = null;
  customerProgress: any;
  totalVisits: number = 0;
  averageDuration: number = 0;
  longestDuration: number = 0;
  shortestDuration: number = 0;
  heatmapData: any[] = []; // [{ heatmapData[]: string, monthLable: string}]
  monthLabel: string = '';
  growth: number = 0;
  loader: boolean = false;
  processing: boolean = false;
  /** Pre-filled WhatsApp message from the action-runner (report flow). */
  initialMessage: string = '';


  constructor(private dialogRef: MatDialogRef<CustomersActionsComponent>) {
    console.log(this.customer);
    this.initialMessage = this.customer?.initialMessage || '';

    // Load weight & height profiles for the BMI card
    if (this.customer && this.customer.customer && this.customer.customer.id) {
      this.loadBmiProfiles(this.customer.customer.id);
    }

    // Call the progress API when the component initializes
    if (this.customer && this.customer.customer && this.customer.customer.id) {
      this.loader = true;
      this.orgService.getCustomerProgress(this.customer.customer.id).subscribe({
        next: (response) => {
          this.loader = false;
          console.log('Customer progress:', response);
          this.customerProgress = response.data || {};
          this.totalVisits = this.getTotalVisits();
          this.averageDuration = this.getAverageDuration();
          this.longestDuration = this.getLongestDuration();
          this.shortestDuration = this.getShortestDuration();

          const grouped = this.getAttendanceGroupedByMonth();
          console.log(grouped);
          const monthKeys = Object.keys(grouped).sort((a, b) => {
            const [yearA, monthA] = a.split('-').map(Number);
            const [yearB, monthB] = b.split('-').map(Number);
            return new Date(yearA, monthA).getTime() - new Date(yearB, monthB).getTime();
          });

          monthKeys.forEach(key => {
            let monthData = this.getMonthlyHeatmapData(key);
            let monthLabel = this.getCurrentMonthLabel(monthData);
            this.heatmapData.push({ heatmapData: monthData, monthLabel: monthLabel });
          });

          console.log(this.heatmapData);
          this.growth = this.getAttendanceGrowth();
          const trend = this.growth >= 0 ? 'up' : 'down';

        },
        error: (error) => {
          console.error('Error fetching customer progress:', error);
          this.loader = false;
          this.customerProgress = null;
        }
      });
    }
  }

  // ----- BMI (uses the most recent weight & height from the customer profile) -----

  /** Fetch the customer's profiles and keep the newest WEIGHT/HEIGHT values. */
  private loadBmiProfiles(customerId: number): void {
    this.customerProfileService.getCustomerProfiles(Number(customerId)).subscribe({
      next: (response) => {
        const profiles: CustomerProfile[] = response?.data || [];

        // Newest-first list of numeric values for a given profile type.
        const sortedValues = (type: string): number[] =>
          profiles
            .filter(p => p.type === type && p.value != null && !isNaN(Number(p.value)) && Number(p.value) > 0)
            .sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime())
            .map(p => Number(p.value));

        const weights = sortedValues('WEIGHT');
        const heights = sortedValues('HEIGHT');

        this.latestWeight = weights.length > 0 ? weights[0] : null;
        this.startWeight = weights.length > 0 ? weights[weights.length - 1] : null;
        this.latestHeight = heights.length > 0 ? heights[0] : null;
      },
      error: (error) => {
        console.error('Error fetching customer profiles for BMI:', error);
        this.latestWeight = null;
        this.latestHeight = null;
      }
    });
  }

  /** True when we have both a weight and a height to compute BMI from. */
  get hasBmi(): boolean {
    return this.latestWeight !== null && this.latestHeight !== null && this.latestHeight > 0;
  }

  /** True when we have at least two weight readings to compare. */
  get hasWeightChange(): boolean {
    return this.startWeight !== null && this.latestWeight !== null && this.startWeight > 0
      && this.startWeight !== this.latestWeight;
  }

  /** Weight change from the first to the latest reading, as a percentage. */
  get weightChangePercent(): number | null {
    if (!this.hasWeightChange) return null;
    const change = ((this.latestWeight as number) - (this.startWeight as number)) / (this.startWeight as number) * 100;
    return parseFloat(change.toFixed(1));
  }

  /** Percentage change formatted with a leading sign, e.g. "-10%" or "+4.2%". */
  get weightChangeLabel(): string {
    const pct = this.weightChangePercent;
    if (pct === null) return '';
    return `${pct > 0 ? '+' : ''}${pct}%`;
  }

  /** Tailwind classes for the weight-change badge (green for loss, red for gain). */
  get weightChangeColor(): string {
    const pct = this.weightChangePercent;
    if (pct === null) return 'text-zinc-500 bg-zinc-50 border-zinc-100';
    return pct <= 0
      ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
      : 'text-rose-600 bg-rose-50 border-rose-100';
  }

  /** Placeholder avatar used when the customer has no photo on file. */
  get placeholderAvatar(): string {
    const name = this.customer?.customer?.firstName || this.customer?.customer?.name || 'Member';
    return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(name)}`;
  }

  /** Customer photo for the report header, falling back to the placeholder. */
  get customerPhotoUrl(): string {
    const dto = this.customer?.customer;
    return dto?.photoUrl || dto?.documentDto?.attachments?.[0]?.url || this.placeholderAvatar;
  }

  /** Swap a broken photo for the placeholder avatar. */
  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && img.src !== this.placeholderAvatar) {
      img.src = this.placeholderAvatar;
    }
  }

  /** BMI = weight(kg) / height(m)^2, rounded to 1 decimal. */
  get bmi(): number | null {
    if (!this.hasBmi) return null;
    const heightInMeters = (this.latestHeight as number) / 100;
    return parseFloat(((this.latestWeight as number) / (heightInMeters * heightInMeters)).toFixed(1));
  }

  /** WHO BMI category label for the current BMI. */
  get bmiCategory(): string {
    const bmi = this.bmi;
    if (bmi === null) return '';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  /** Tailwind text-colour class matching the current BMI category. */
  get bmiCategoryColor(): string {
    switch (this.bmiCategory) {
      case 'Underweight': return 'text-sky-600';
      case 'Normal': return 'text-emerald-600';
      case 'Overweight': return 'text-amber-600';
      case 'Obese': return 'text-rose-600';
      default: return 'text-zinc-600';
    }
  }

  /** Marker position on the BMI scale (0-100%), scale spans BMI 15 to 40. */
  get bmiMarkerPosition(): number {
    const bmi = this.bmi;
    if (bmi === null) return 0;
    const min = 15;
    const max = 40;
    const clamped = Math.min(Math.max(bmi, min), max);
    return ((clamped - min) / (max - min)) * 100;
  }

  /** First letter of the customer name, used as an avatar fallback on the BMI scale. */
  get customerInitial(): string {
    const name = this.customer?.customer?.firstName || this.customer?.customer?.name || '';
    return name.trim().charAt(0).toUpperCase() || '?';
  }

  calculateWidth(value: number): number {
    // Calculate width as percentage (up to 100%) based on streak value
    return Math.min(value * 5, 100);
  }

  calculateRemainingDaysWidth(remainingDays: number): number {
    // Calculate width as percentage based on remaining days (up to 100%)
    return Math.min((remainingDays / 365) * 100, 100);
  }

  getWeeklyAttendanceData(): any[] {
    // Extract and format weekly attendance data from customerProgress
    if (!this.customerProgress?.weeklyAttendance) {
      return [];
    }

    // Get the keys (dates) from the weeklyAttendance object
    const dates = Object.keys(this.customerProgress.weeklyAttendance);

    // Map each date to an object containing date and attendance data
    return dates.map(date => ({
      date,
      ...this.customerProgress.weeklyAttendance[date]
    }));
  }

  getTotalVisits(): number {
    // Count visits where checkOutAt is present
    if (!this.customerProgress?.weeklyAttendance) {
      return 0;
    }

    const attendanceData = this.customerProgress.weeklyAttendance;
    return Object.values(attendanceData).filter((day: any) => day.checkOutAt).length;
  }

  private getDurations(): number[] {
    if (!this.customerProgress?.weeklyAttendance) {
      return [];
    }

    const attendanceData = this.customerProgress.weeklyAttendance;
    const durations: number[] = [];

    Object.entries(attendanceData).forEach(([date, day]: [string, any]) => {
      if (day.checkInAt && day.checkOutAt) {
        const checkInTime = new Date(day.checkInAt).getTime();
        const checkOutTime = new Date(day.checkOutAt).getTime();
        const durationMinutes = (checkOutTime - checkInTime) / (1000 * 60);

        if (durationMinutes > 0) {
          durations.push(durationMinutes);
        }
      }
    });

    return durations;
  }

  getAverageDuration(): number {
    const durations = this.getDurations();
    if (durations.length === 0) return 0;

    const sum = durations.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / durations.length);
  }

  getLongestDuration(): number {
    const durations = this.getDurations();
    if (durations.length === 0) return 0;
    return Math.round(Math.max(...durations));
  }

  getShortestDuration(): number {
    const durations = this.getDurations();
    if (durations.length === 0) return 0;
    return Math.round(Math.min(...durations));

  }

  getAttendanceGroupedByMonth() {
    const data = this.customerProgress?.weeklyAttendance;
    if (!data) return {};

    return Object.entries(data).reduce((acc: any, [date, value]) => {
      const d = new Date(date);
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`; // unique month key

      if (!acc[monthKey]) {
        acc[monthKey] = {};
      }

      acc[monthKey][date] = value;
      return acc;
    }, {});
  }

  getMonthLabels(): string[] {
    const grouped = this.getAttendanceGroupedByMonth();

    return Object.keys(grouped)
      .map(key => {
        const [year, month] = key.split('-').map(Number);
        return new Date(year, month).toLocaleString('default', {
          month: 'short',
          year: 'numeric'
        });
      })
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }

  getMonthlyHeatmapData(monthKey: string) {
    const grouped = this.getAttendanceGroupedByMonth();
    const monthData = grouped[monthKey] || {};

    const [year, month] = monthKey.split('-').map(Number);
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const padding = firstDayOfMonth.getDay(); // 0 is Sunday, 1 is Monday...
    const result: any[] = [];

    // Add padding for days before the 1st of the month
    for (let i = 0; i < padding; i++) {
      result.push({ empty: true });
    }

    // Add every day of the month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      // Create local date string YYYY-MM-DD
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const attendance = monthData[dateStr] || {};

      let duration = 0;
      if (attendance.checkInAt && attendance.checkOutAt) {
        const checkIn = new Date(attendance.checkInAt).getTime();
        const checkOut = new Date(attendance.checkOutAt).getTime();
        duration = Math.max((checkOut - checkIn) / (1000 * 60), 0);
      }

      result.push({
        date: dateStr,
        duration,
        future: new Date(year, month, day) > new Date(),
        level: this.getIntensityLevel(duration),
        empty: false
      });
    }

    return result;
  }


  getIntensityLevel(duration: number): number {
    if (duration === 0) return 0;        // no visit
    if (duration < 30) return 1;         // low
    if (duration < 90) return 2;         // medium
    return 3;                            // high
  }

  getGithubHeatmapData() {
    if (!this.customerProgress?.weeklyAttendance) return [];

    const entries = Object.entries(this.customerProgress.weeklyAttendance)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());

    if (!entries.length) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDate = new Date(entries[0][0]);
    const firstDay = firstDate.getDay();

    const heatmap: any[] = [];

    // Padding before first weekday
    for (let i = 0; i < firstDay; i++) {
      heatmap.push({ empty: true });
    }

    entries.forEach(([date, day]: [string, any]) => {

      const currentDate = new Date(date);
      currentDate.setHours(0, 0, 0, 0);

      let duration = 0;

      if (day.checkInAt && day.checkOutAt) {
        const checkIn = new Date(day.checkInAt).getTime();
        const checkOut = new Date(day.checkOutAt).getTime();
        duration = Math.max((checkOut - checkIn) / (1000 * 60), 0);
      }

      heatmap.push({
        date,
        duration,
        level: this.getIntensity(duration),
        empty: false,
        future: currentDate > today
      });
    });

    return heatmap;
  }


  getCurrentMonthLabel(data: any): string {
    if (!data || !Array.isArray(data)) return '';

    const firstValidDay = data.find(d => !d.empty);
    if (!firstValidDay) return '';

    return new Date(firstValidDay.date).toLocaleString('default', {
      month: 'short',
      year: 'numeric'
    });
  }

  getIntensity(duration: number): number {
    if (duration === 0) return 0;
    if (duration < 30) return 1;
    if (duration < 90) return 2;
    return 3;
  }

  getMonthlyAttendanceCounts(groupedData: any) {
    const result: any = {};

    Object.entries(groupedData).forEach(([monthKey, days]: [string, any]) => {

      const attendedDays = Object.values(days).filter((day: any) =>
        day.checkInAt && day.checkOutAt
      ).length;

      result[monthKey] = attendedDays;
    });

    return result;
  }

  getTotalMinutes(heatmapData: any[]): number {
    return heatmapData.reduce((sum, day) => sum + day.duration, 0);
  }

  getAttendanceGrowth(): number {

    if (!this.heatmapData || this.heatmapData.length < 2) {
      return 0;
    }

    // assuming sorted oldest → newest
    const previousMonth = this.heatmapData[0];
    const currentMonth = this.heatmapData[1];

    const prevTotal = this.getTotalMinutes(previousMonth.heatmapData);
    const currTotal = this.getTotalMinutes(currentMonth.heatmapData);

    if (prevTotal === 0) {
      return currTotal > 0 ? 100 : 0;
    }

    return Number((((currTotal - prevTotal) / prevTotal) * 100).toFixed(1));
  }

  @ViewChild('reportCard') reportCard!: ElementRef;

  async prepareImage() {
    this.processing = true;
    const element = this.reportCard.nativeElement;

    try {
      const blob = await toBlob(element, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        skipFonts: true,   // 👈 IMPORTANT
        // Capture the full content size so edges aren't cropped.
        width: element.scrollWidth,
        height: element.scrollHeight,
        // Exclude the share button / actions from the captured snapshot
        filter: (node: HTMLElement) =>
          !(node instanceof HTMLElement && node.classList?.contains('no-capture'))
      });

      if (!blob) throw new Error('Image generation failed');

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      await Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Opening WhatsApp...',
        timer: 1500,
        showConfirmButton: false
      });

      // ✅ Open WhatsApp
      const phoneNumber = this.customer.customer.contactNumber.replace("+", ''); // replace with dynamic number
      const shopName = localStorage.getItem("shopName") || '';
      const messageText = (this.initialMessage || 'Hi 👋 Here is your attendance report.') +
        (shopName ? `\n– ${shopName}` : '') +
        `\n\nDownload our app: ${environment.appDownloadUrl}\n` +
        `Note: Use the same email & phone number you gave at the gym to access your existing membership.`;
      const message = encodeURIComponent(messageText);

      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

      window.open(whatsappUrl, '_blank');
      this.processing = false;

    } catch (error) {
      this.processing = false;
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to generate report image.'
      });
    }
  }

  copyReportAsImage() {
    this.processing = true;
    this.prepareImage();
  }
}
