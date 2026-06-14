import { Component, HostListener, inject, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Subscription } from 'rxjs';
import { DashboardService } from 'src/app/services/dashboard.service';
import { MembershipSummary, ShopModel, WaitListDto } from 'src/app/models/shop.model';
import { ResponseDate } from 'src/app/app.component';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { SweatAlertService } from 'src/app/services/sweat-alert.service';
import moment from 'moment-timezone';
import { AblyService } from 'src/app/services/ably.service';
import { ShopActionsComponent } from '../settings/components/business-setup/setup-components/location/location-action/shop-actions/shop-actions.component';
import { AuthService } from 'src/app/services/auth.service';
import { ChallengeDetailsDialogComponent } from '../settings/components/business-setup/setup-components/challenge-builder/challenge-details-dialog/challenge-details-dialog.component';
import Swal from 'sweetalert2';
import { PointOfSaleComponent } from '../components/point-of-sale/point-of-sale.component';
import { ImagePreviewDialog } from '../customers/customers.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false
})
export class HomeComponent implements OnDestroy {

  private subscription?: Subscription;
  timeZone = 'Asia/Kolkata';
  dialog = inject(MatDialog);
  dashboardService = inject(DashboardService);
  orgApiService = inject(OrganizationServiceService);
  swallService = inject(SweatAlertService);
  private sub!: Subscription;


  selectedCustomer: any;
  configurePanelOpen: boolean = false;
  isMobileView: any = false;

  shopCategory = new Map<string, string>([
    ['Fitness & Gyms', 'Gym'],
    ['Health & Wellness', 'Spa'],
    ['Restaurants', 'Food & Beverage'],
    ['Electronics', 'Gadgets'],
    // add more mappings here
  ])

  constructor(private ablyService: AblyService, private authService: AuthService) {
  }


  async ngOnInit() {
    console.log('HomeComponent ngOnInit');

    // Clean up any existing subscription to prevent duplicates
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }

    await this.initialize();
    this.checkScreenSize();
    this.subscription = this.ablyService.onMessage('home').subscribe(msg => {
      console.log('Home received:', msg.data);
      // this.trailListCustomer.unshift(msg.data);
      this.getTrailSessions();
    });
  }

  ngOnDestroy() {
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobileView = window.innerWidth <= 768;
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

    this.loadChallenges();
    console.log("Loading loadChallenges");

    // this.checkSubscriptionPlan(); // For Org Billing 
  }

  checkSubscriptionPlan() {
    this.orgApiService.getOrganizationDetails().subscribe({
      next: (res: any) => {
        const plan = res.data?.organizationPlan;
        if (plan) {
          const endDateStr = plan.endDate;
          if (!endDateStr) return;

          // Calculate remaining days using moment (timezone aware)
          const endMoment = moment.utc(endDateStr);
          const nowMoment = moment.tz(this.timeZone);
          const daysDiff = endMoment.tz(this.timeZone).diff(nowMoment, 'days');

          // Flow 1: if active and autorenew false and its expiring soon we need to show alert dialog
          if (plan.active && plan.autoRenew === false && daysDiff >= 0 && daysDiff <= 7) {
            Swal.fire({
              icon: 'warning',
              title: 'Subscription Expiring Soon',
              html: `Your active plan <strong>${plan.planName || 'Basic Plan'}</strong> is set to expire on <strong>${moment(endDateStr).format('LL')}</strong> (${daysDiff} days remaining).<br>Auto-renewal is disabled. Please renew/upgrade to avoid service interruption.`,
              confirmButtonText: 'Renew Now',
              showCancelButton: true,
              cancelButtonText: 'Remind Me Later',
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              customClass: {
                popup: 'rounded-xl',
                confirmButton: 'rounded-lg px-4 py-2 font-semibold',
                cancelButton: 'rounded-lg px-4 py-2 font-semibold'
              }
            }).then((result) => {
              if (result.isConfirmed) {
                this.dialog.open(PointOfSaleComponent, {
                  width: '100%',
                  maxWidth: '100vw',
                  height: '100%',
                  panelClass: 'full-screen-dialog',
                  disableClose: true
                });
              }
            });
          }

          // Flow 2: if not active and expired by endDate then we need to show different alert that account will deactivate in 3 days
          else if (!plan.active && daysDiff < 0) {
            Swal.fire({
              icon: 'error',
              title: 'Subscription Expired',
              html: `Your subscription to <strong>${plan.planName || 'Basic Plan'}</strong> expired on <strong>${moment(endDateStr).format('LL')}</strong>.<br><strong style="color: #ea580c;">Warning:</strong> Your account will be fully deactivated in 3 days. Please purchase a new plan immediately.`,
              confirmButtonText: 'Renew Subscription',
              allowOutsideClick: false,
              allowEscapeKey: false,
              confirmButtonColor: '#3085d6',
              customClass: {
                popup: 'rounded-xl',
                confirmButton: 'rounded-lg px-4 py-2 font-semibold'
              }
            }).then((result) => {
              if (result.isConfirmed) {
                this.dialog.open(PointOfSaleComponent, {
                  width: '100%',
                  maxWidth: '100vw',
                  height: '100%',
                  panelClass: 'full-screen-dialog',
                  disableClose: true
                });
              }
            });
          }
        }
      },
      error: (err: any) => {
        console.error('Error fetching subscription details:', err);
      }
    });
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

  // Challenge Section
  challenges: any[] = [];
  challengeMap: Map<number, any> = new Map();
  challengeParticipants: any[] = [];
  selectedChallengeId: any = '';
  challengeDateRange = {
    start: moment().startOf('day').format('YYYY-MM-DD'),
    end: moment().endOf('day').format('YYYY-MM-DD')
  };
  selectedChallengeTarget: number = 10;
  isChallengeLoading: boolean = false;

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

  toggleShopVisibility() {
    if (!this.selectedShop || this.selectedShop.active === null) return;

    console.log('Toggling visibility for shop:', this.selectedShop);

    this.orgApiService.getOrganizationDetails().subscribe({
      next: (res: ResponseDate) => {
        if (res.data && res.data.organizationPlan && res.data.organizationPlan.bucketDtos) {
          const buckets = res.data.organizationPlan.bucketDtos;

          // Find the LOCATION bucket
          const locationBucket = buckets.find(
            (b: any) => b.type === 'LOCATION'
          );

          if (locationBucket && !this.selectedShop.active) {
            const available = locationBucket.allocated - locationBucket.used;

            if (available > 0) {
              console.log('✅ You have free locations available:', available);
            } else {
              console.warn('❌ No free location slots left.');
              this.swallService.error("Upgrade Plan Make this shop online");
              return;
            }
          }

          this.orgApiService.toggleVisibility(this.selectedShop.code!).subscribe({
            next: (res: ResponseDate) => {
              // Update the selected shop
              this.selectedShop = { ...this.selectedShop, ...res.data };

              if (res.data.active) {
                this.swallService.success("Hurray! Your shop is now ready to receive online orders.", 2500);
              } else {
                this.swallService.success("Your Shop is offline", 2500);
              }
            },
            error: (err: any) => {
              this.swallService.error("Failed to complete the action. We’ve informed our team. Please try again later.");
              console.error("Toggle visibility error:", err);
            }
          });
        } else {
          this.swallService.error("Purchase plan to active this location");
        }
      },
      error: (err: any) => {
        console.error('Error fetching organization details', err);
        this.swallService.error("Failed to fetch organization details");
      }
    });
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
            localStorage.setItem("shopName", this.selectedShop.name!);
            // Initialize Ably service
            this.ablyService.initialize("Ek4x8A.f1K1KA:QOg5QxJ5pCLKTD7MAbgHej3gaUhr07MXxLb6XzKiAu4");
            this.ablyService.setShopCode(this.selectedShop.code!);

            this.selectedShop.shopCategory = this.shopCategory.get(this.selectedShop.primaryIndustry.name)
              ? this.shopCategory.get(this.selectedShop.primaryIndustry.name)
              : this.selectedShop.primaryIndustry.name;
          }

          resolve();
        },
        error: (err: any) => {
          this.isLoading = false;
          this.swallService.error("Something went wrong, please try again later");
          this.authService.logout();
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

  // Customer Actions
  openCustomerActions(customer: any): void {
    if (!customer) return;
    this.selectedCustomer = customer;
    this.configurePanelOpen = true;
  }

  openImagePreview(url: string, event: MouseEvent): void {
    event.stopPropagation(); // Prevent opening customer actions sidebar
    this.dialog.open(ImagePreviewDialog, {
      data: { url },
      panelClass: 'image-preview-dialog',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
  }

  closeConfigurePanel() {
    this.configurePanelOpen = false;
    this.loadGymDashboard();
    this.getTrailSessions();
  }

  // Challenge Participants Methods
  loadChallenges() {
    this.orgApiService.getChallengesByShop(0, 100, '', 'ACTIVE').subscribe({
      next: (res: any) => {
        this.challenges = res.data?.content || [];
        this.challenges.forEach(c => this.challengeMap.set(c.id, c));
        this.loadChallengeParticipants();
      },
      error: (err) => console.error('Error loading challenges:', err)
    });
  }

  loadChallengeParticipants() {
    this.isChallengeLoading = true;

    const selected = this.challenges.find(c => c.id == this.selectedChallengeId);
    this.selectedChallengeTarget = selected?.targetValue || 10;

    // Convert local start/end to UTC for API
    const fromDate = moment(this.challengeDateRange.start).startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';
    const toDate = moment(this.challengeDateRange.end).endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';

    this.orgApiService.getChallengeCustomers(
      this.selectedChallengeId,
      0,
      10,
      '',
      'ALL',
      fromDate,
      toDate
    ).subscribe({
      next: (res: any) => {
        this.challengeParticipants = res.data?.content || [];
        this.isChallengeLoading = false;
      },
      error: (err) => {
        console.error('Error loading challenge participants:', err);
        this.isChallengeLoading = false;
      }
    });
  }

  onChallengeFilterChange() {
    this.loadChallengeParticipants();
  }

  getChallengeForParticipant(participant: any) {
    // Attempt to find challenge by challengeId if available, or just return basic info
    const challengeId = participant.challengeId;
    return this.challengeMap.get(challengeId);
  }

  viewChallengeDetails(challengeId: number) {
    if (!challengeId) return;

    this.isChallengeLoading = true;
    this.orgApiService.getChallengeById(challengeId).subscribe({
      next: (res: any) => {
        this.isChallengeLoading = false;
        if (res.data) {
          this.dialog.open(ChallengeDetailsDialogComponent, {
            data: {
              challenge: res.data
            },
            width: '550px',
            maxWidth: '95vw',
            panelClass: 'custom-dialog-container'
          });
        }
      },
      error: (err: any) => {
        this.isChallengeLoading = false;
        console.error('Error fetching challenge details:', err);
        Swal.fire('Error', 'Could not fetch challenge details.', 'error');
      }
    });
  }

  // Chart js 


}