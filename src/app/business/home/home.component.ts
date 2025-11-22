import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Subscription } from 'rxjs';
import { DashboardService } from 'src/app/services/dashboard.service';
import { MembershipSummary, ShopModel, WaitListDto } from 'src/app/models/shop.model';
import { ResponseDate } from 'src/app/app.component';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { SweatAlertService } from 'src/app/services/sweat-alert.service';
import * as moment from 'moment-timezone';
import { AblyService } from 'src/app/services/ably.service';
import { ShopActionsComponent } from '../settings/components/business-setup/setup-components/location/location-action/shop-actions/shop-actions.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false
})
export class HomeComponent {

  private subscription!: Subscription;
  timeZone = 'Asia/Kolkata';
  dialog = inject(MatDialog);
  dashboardService = inject(DashboardService);
  orgApiService = inject(OrganizationServiceService);
  swallService = inject(SweatAlertService);
  private sub!: Subscription;


  shopCategory = new Map<string, string>([
    ['Fitness & Gyms', 'Gym'],
    ['Health & Wellness', 'Spa'],
    ['Restaurants', 'Food & Beverage'],
    ['Electronics', 'Gadgets'],
    // add more mappings here
  ])

  constructor(private ablyService: AblyService) {
  }



  async ngOnInit() {
    await this.initialize();
    this.subscription = this.ablyService.onMessage('home').subscribe(msg => {
      console.log('Home received:', msg.data);
      // this.trailListCustomer.unshift(msg.data);
      this.getTrailSessions();
    });
  }

  private async initialize() {
    console.log("Loading Location Shops");

    await this.getLocations();
    console.log("Loading Location loded");

    this.getCurrentUser();
    console.log("Loading getCurrentUser Shops");

    this.loadGymDashboard();
    console.log("Loading loadGymDashboard Shops");

    this.getTrailSessions();
    console.log("Loading getTrailSessions Shops");

  }

  isLoading = false;
  shops: ShopModel[] = [];
  fallback = "";
  selectedShop!: ShopModel;
  currentUser: any;

  // Service Model
  membershipSummary!: MembershipSummary;
  renewalTrends: any;
  hourlyComparision: any[] = [];
  trailListCustomer: WaitListDto[] = [];
  checkInPercentage = "0";

  getCurrentUser() {
    let user = localStorage.getItem('currentUser');
    if (user)
      this.currentUser = JSON.parse(user);
  }

  getGreeting(): string {
    const currentHour = new Date().getHours();
    
    if (currentHour >= 5 && currentHour < 12) {
      return 'Good morning';
    } else if (currentHour >= 12 && currentHour < 18) {
      return 'Good afternoon';
    } else if (currentHour >= 18 && currentHour < 22) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  }

  getTrailSessions() {
    if (localStorage.getItem("shopCode"))
      this.orgApiService.getTrailSessions().subscribe({
        next: (res: any) => {
          this.trailListCustomer = res.data
        },
        error: (err: any) => {

        }
      })
  }

  changeTrailStatus(waitList: WaitListDto, status: string) {
    this.orgApiService.updateTrailSessionStatus(waitList, status).subscribe({
      next: (res: any) => {
        this.swallService.success("Trail Session Updated");
      },
      error: (err: any) => {

      }
    })
  }


  private async getLocations(): Promise<void> {
    this.isLoading = true;

    return new Promise((resolve, reject) => {
      this.orgApiService.getLocations().subscribe({
        next: async (res: ResponseDate) => {
          this.isLoading = false;

          this.shops = res.data.map((shop: ShopModel) => ({
            code: shop.code,
            address: this.formatAddress(shop.addressDto),
            image: shop.documentDto?.attachments?.length && shop.documentDto.attachments[0]?.url
              ? `https://pub-f3cc65a63e2a4ca88e58aae1aedfa9f6.r2.dev/${shop.documentDto.attachments[0].url}`
              : this.fallback,
            ...shop
          }));

          if (this.shops.length > 0) {
            this.selectedShop = this.shops[0];
            localStorage.setItem("shopCode", this.selectedShop.code!);
            this.ablyService.initialize("Ek4x8A.f1K1KA:QOg5QxJ5pCLKTD7MAbgHej3gaUhr07MXxLb6XzKiAu4");
            this.ablyService.setShopCode(this.selectedShop.code!);
            console.log("ShopCode", this.selectedShop.code!);

            this.selectedShop.shopCategory = this.shopCategory.get(this.selectedShop.primaryIndustry.name)
              ? this.shopCategory.get(this.selectedShop.primaryIndustry.name)
              : this.selectedShop.primaryIndustry.name;
          }

          resolve();
        },
        error: (err: any) => {
          this.isLoading = false;
          reject(err);
        }
      });
    });
  }


  createShop() {
    const dialogRef = this.dialog.open(ShopActionsComponent, {
      data: { isUpdate: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with:', result);
      this.initialize();
    });
  }

  formatAddress(address: any): string {
    if (!address) return '';

    return [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.postalCode,
      address.country
    ]
      .filter(Boolean) // remove null/undefined
      .join(', ');
  }

  // 🔹 Converts to timezone-specific Date
  private toTimeZoneDate(date: any): Date | null {
    if (!date) return null;
    return moment.tz(date, this.timeZone).toDate();
  }

  // 🔹 Calculates remaining days (timezone-aware)
  private getRemainingDays(endDate: Date): number {
    if (!endDate) return 0;

    // Parse the UTC date first
    const end = moment.utc(endDate);          // treat input as UTC
    const now = moment.tz(this.timeZone);    // current time in app timezone

    const diffDays = end.tz(this.timeZone).diff(now, 'days'); // convert endDate to same timezone
    return Math.max(diffDays, 0);
  }



  loadDashboard(orgId: number, businessType: string) {
    if (businessType === 'gym') {
      this.loadGymDashboard();
    } else if (businessType === 'salon') {
      // this.loadSalonDashboard();
    } else if (businessType === 'pet-care') {
      // this.loadPetCareDashboard();
    }
  }

  loadGymDashboard() {
    if (localStorage.getItem("shopCode"))
      forkJoin({
        membershipSummary: this.dashboardService.getMembershipSummary(),
        hourlyComparision: this.dashboardService.getHourlyCheckIns(),
        // renewalTrends: this.dashboardService.getRenewalTrends()
      }).subscribe({
        next: (res) => {
          this.membershipSummary = res.membershipSummary.data;
          this.hourlyComparision = res.hourlyComparision.filter(d => d.hour >= 4);
          this.checkInPercentage = this.getCurrentHourComparison(this.hourlyComparision);

          if (this.membershipSummary?.expiringMemberships?.length) {
            this.membershipSummary.expiringMemberships = this.membershipSummary.expiringMemberships.map((m: any) => {
              const start = this.toTimeZoneDate(m.startDate);
              const end = this.toTimeZoneDate(m.endDate);
              const remainingDays = this.getRemainingDays(end!);
              return {
                ...m,
                startDate: start,
                endDate: end,
                remainingDays,
              };
            });
          }
        },
        error: (err) => console.error(err)
      });
  }

  getCurrentHourComparison(attendanceData: any[]): string {
    const now = new Date();
    const currentHour = now.getHours(); // 0-23

    // Find the data entry for the current hour
    const currentData = attendanceData.find(d => currentHour >= d.hour && currentHour < d.hour + 2);

    if (!currentData) {
      return '-';
    }

    const today = currentData.todayMembers;
    const mean = currentData.meanMembers;

    if (mean === 0) return '0%';

    const diffPercentage = ((mean - today) / mean) * 100;

    return `${diffPercentage.toFixed(1)}% less than average`;
  }

  // Chart js 



}