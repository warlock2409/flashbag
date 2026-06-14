import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ShopService } from '../../services/shop.service';
import { ShopHeaderComponent } from './components/shop-header/shop-header.component';
import { ShopTypeToggleComponent } from './components/shop-type-toggle/shop-type-toggle.component';
import { ShopServicesComponent } from './components/shop-services/shop-services.component';
import { ShopTeamComponent } from './components/shop-team/shop-team.component';
import { ShopReviewsComponent } from './components/shop-reviews/shop-reviews.component';
import { ShopAboutComponent } from './components/shop-about/shop-about.component';
import { ShopProductsComponent } from './components/shop-products/shop-products.component';
import { ShopRentalsComponent } from './components/shop-rentals/shop-rentals.component';
import { ShopMembershipComponent } from './components/shop-membership/shop-membership.component';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-shop-details',
  standalone: true,
  imports: [
    CommonModule,
    ShopHeaderComponent,
    ShopTypeToggleComponent,
    ShopServicesComponent,
    ShopProductsComponent,
    ShopRentalsComponent,
    ShopTeamComponent,
    ShopReviewsComponent,
    ShopAboutComponent,
    ShopMembershipComponent,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="shop-details-wrapper bg-[#0f172a] min-h-screen text-slate-100">
      <div class="shop-details" *ngIf="!loading">
        <!-- Top App Banner Card -->
        <div class="flex items-center justify-between bg-slate-800/40 border border-white/5 rounded-2xl p-4 mb-6 backdrop-blur-xl">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-violet-900/40 ring-1 ring-white/20 overflow-hidden">
              <img src="assets/png/logo.png" alt="Flashbag Logo" class="w-full h-full object-contain">
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold !text-white text-base !mb-0">9myle Android App</h3>
              </div>
              <p class="text-slate-400 text-[12px] sm:text-xs font-medium !mb-0">Track workout and participate in challenges</p>
            </div>
          </div>
          
          <div class="flex items-center sm:gap-4">
            <a href="https://play.google.com/store/apps/details?id=com.ninemyle.app" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 px-3 py-1.5 sm:px-5 sm:py-2 bg-violet-500 text-white rounded-xl text-[10px] sm:text-xs font-bold hover:bg-violet-700 transition-all shadow-lg hover:scale-105 active:scale-95 border border-violet-400/60 no-underline">
              <span>DOWNLOAD</span>
            </a>
          </div>
        </div>
        
        <app-shop-header [shopData]="shopData"></app-shop-header>
        
        <app-shop-type-toggle 
          [activeType]="activeType"
          [hasProducts]="shopData.products?.length > 0"
          [hasServices]="shopData.services?.length > 0"
          [hasMemberships]="shopData.memberships?.length > 0"
          (typeChange)="onTypeChange($event)">
        </app-shop-type-toggle>

      <div class="mt-6">
        <ng-container [ngSwitch]="activeType">
          <app-shop-membership 
            *ngSwitchCase="'memberships'"
            [memberships]="shopData.memberships"
            [shopCode]="shopCode"
            [shopName]="shopData.name"
            [hasTrialBooking]="hasTrialBooking"
            [upcomingEvents]="upcomingEvents"
            [activeMembership]="activeMembership">
          </app-shop-membership>

          <app-shop-services 
            *ngSwitchCase="'services'"
            [services]="shopData.services">
          </app-shop-services>

          <app-shop-products 
            *ngSwitchCase="'products'"
            [products]="shopData.products">
          </app-shop-products>

          <app-shop-rentals 
            *ngSwitchCase="'rentals'"
            [rentals]="shopData.rentals">
          </app-shop-rentals>
        </ng-container>
      </div>

        <app-shop-about 
          [about]="shopData.about"
          [openingTimes]="shopData.openingTimes"
          [location]="shopData.location"
          [latitude]="shopData.latitude"
          [longitude]="shopData.longitude">
        </app-shop-about>

        <!-- Business Enquiry Section -->
        <div class="mt-8 mb-6 bg-slate-800/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl">
          <div class="absolute -top-6 -right-6 opacity-5">
            <mat-icon class="!w-32 !h-32 !text-[8rem]">business_center</mat-icon>
          </div>
          
          <div class="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div class="max-w-lg">
              <h3 class="text-lg sm:text-xl font-bold !text-white !mb-1 italic">Are you a Gym Owner?</h3>
              <p class="text-slate-300 text-[12px] sm:text-sm leading-relaxed font-medium">
                9myle is a gym marketplace and business management tool to scale your fitness center.
              </p>
            </div>
            
            <button (click)="onContact()" 
              class="flex-shrink-0 w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-900/20">
              <mat-icon class="!text-base">chat</mat-icon>
              <span>CONTACT US</span>
            </button>
          </div>
        </div>
      </div>
      
      <div *ngIf="loading" class="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <div class="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-lg font-medium">Loading shop details...</p>
      </div>
    </div>
  `,
  styles: [`
    .shop-details {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      box-sizing: border-box;

      @media (max-width: 768px) {
        padding: 16px 12px;
      }
    }
  `]
})
export class ShopDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private shopService = inject(ShopService);
  private authService = inject(AuthService);

  isLoggedIn = false;

  activeType: 'products' | 'services' | 'rentals' | 'memberships' = 'memberships';
  shopCode: string | null = null;
  loading = true;
  hasTrialBooking = false;
  hasActiveMembership = false;
  activeMembership: any = null;
  upcomingEvents: any[] = [];

  shopData: any = {
    name: '',
    rating: '0.0',
    totalReviews: 0,
    images: [],
    location: '',
    latitude: 0,
    longitude: 0,
    services: [],
    memberships: [],
    reviews: [],
    team: [],
    about: '',
    openingTimes: [],
    products: [],
    rentals: []
  };

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.shopCode = params['shopCode'];
      if (this.shopCode) {
        this.fetchShopDetails(this.shopCode);
      }
    });

    // Check login status
    this.isLoggedIn = this.authService.checkAuth();
  }

  fetchShopDetails(code: string) {
    this.loading = true;
    this.shopService.getShopDetails(code).subscribe({
      next: (response) => {
        const data = response.data;
        const images = data.documentDto?.attachments?.map((att: any) => att.url) || [];

        this.shopData = {
          name: data.name,
          rating: '4.8',
          totalReviews: 100,
          images: images.length === 1 ? [images[0], images[0], images[0]] : images,
          location: data.addressDto ?
            `${data.addressDto.addressLine1}, ${data.addressDto.addressLine2}, ${data.addressDto.city}, ${data.addressDto.state} - ${data.addressDto.postalCode}`
            : data.email,
          latitude: data.addressDto?.latitude,
          longitude: data.addressDto?.longitude,
          memberships: data.membershipPlans?.map((plan: any) => ({
            id: plan.id,
            name: plan.name,
            price: plan.basePrice,
            description: plan.description,
            duration: plan.benefits?.[0]?.durationValue ? `${plan.benefits[0].durationValue} ${plan.benefits[0].durationUnit}` : '',
            benefits: plan.benefits
          })) || [],
          services: [],
          products: [],
          reviews: [],
          team: [],
          about: `Welcome to ${data.shopCode}. Contact: ${data.phone}`,
          openingTimes: this.formatOpeningTimes(data.shopHours),
          rentals: []
        };

        this.fetchCustomerEvents();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching shop details', err);
        this.loading = false;
        if (err.status === 401) {
          this.router.navigate([`/login/s/${code}`]);
        }
      }
    });
  }

  fetchCustomerEvents() {
    const firebaseUid = localStorage.getItem('firebaseUid');
    if (!firebaseUid) return;

    this.shopService.getCustomerEvents(firebaseUid).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.upcomingEvents = response.data;
          // Check if any event is a trial booking for the current shop
          this.hasTrialBooking = this.upcomingEvents.some(event =>
            event.shopDto?.code === this.shopCode && (event.status === 'REQUESTED' || event.status === 'APPROVED' || event.status === 'DECLINED')
          );

          // Fetch additional shop-specific customer details
          this.fetchCustomerShopDetails(firebaseUid);
        }
      },
      error: (err: any) => {
        console.error('Error fetching customer events', err);
      }
    });
  }
  fetchCustomerShopDetails(uid: string) {
    if (!this.shopCode) return;

    this.shopService.getCustomerShopDetails(uid, this.shopCode).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.customerMembershipsDto) {
          const memberships = response.data.customerMembershipsDto;
          this.hasActiveMembership = memberships.length > 0;
          this.activeMembership = memberships.find((m: any) => m.status === 'ACTIVE') || memberships[0] || null;
        }
      },
      error: (err) => {
        console.error('Error fetching customer shop details', err);
      }
    });
  }

  private formatOpeningTimes(shopHours: any[]) {
    const allDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    return allDays.map(day => {
      const hourEntry = shopHours?.find((h: any) =>
        h.day.split(',').map((d: string) => d.trim()).includes(day)
      );
      const session = hourEntry?.sessions?.[0];

      let hoursStr = 'Holiday';
      if (hourEntry?.enabled && session) {
        try {
          const start = new Date(session.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
          const end = new Date(session.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
          hoursStr = `${start} - ${end}`;
        } catch (e) {
          console.error('Error parsing session time', e);
        }
      }
      return { day, hours: hoursStr };
    });
  }

  onLogout() {
    this.authService.logout();
  }

  onContact() {
    console.log('Business Enquiry Contact Clicked');
    // You can add logic here to open a form, WhatsApp, or email
    window.open('https://wa.me/917871227902', '_blank');
  }

  onTypeChange(type: 'products' | 'services' | 'rentals' | 'memberships') {
    this.activeType = type;
  }
}
