import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe, NgClass, NgFor } from '@angular/common';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { ElementRef, ViewChild } from '@angular/core';
import { toBlob } from 'html-to-image';
import Swal from 'sweetalert2';
import { MatButtonModule } from '@angular/material/button';

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


  constructor(private dialogRef: MatDialogRef<CustomersActionsComponent>) {
    console.log(this.customer);

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
          const monthKeys = Object.keys(grouped);
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
    const monthData = grouped[monthKey];

    if (!monthData) return [];

    return Object.entries(monthData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, day]: [string, any]) => {

        let duration = 0;

        if (day.checkInAt && day.checkOutAt) {
          const checkIn = new Date(day.checkInAt).getTime();
          const checkOut = new Date(day.checkOutAt).getTime();
          duration = Math.max((checkOut - checkIn) / (1000 * 60), 0);
        }

        return {
          date,
          duration,
          future: new Date(date) > new Date(),
          level: this.getIntensityLevel(duration)
        };
      });
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
    console.log(data, 'data');

    if (!data) return '';

    const firstDate = data[0]?.date || '';
    console.log(firstDate);

    return new Date(firstDate).toLocaleString('default', {
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
        skipFonts: true   // 👈 IMPORTANT
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
      const message = encodeURIComponent(
        'Hi 👋 Here is your attendance report.'
      );

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
