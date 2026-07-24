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
import { ShopTrainerComponent } from './components/shop-trainer/shop-trainer.component';
import { ShopProductsComponent } from './components/shop-products/shop-products.component';
import { ShopRentalsComponent } from './components/shop-rentals/shop-rentals.component';
import { ShopMembershipComponent } from './components/shop-membership/shop-membership.component';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { OnboardingWizardComponent } from '../shared/onboarding-wizard/onboarding-wizard.component';
import { TrialDatePickerDialogComponent } from '../shared/trial-date-picker-dialog/trial-date-picker-dialog.component';
import Swal from 'sweetalert2';

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
    ShopTrainerComponent,
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

        <!-- Programs Section -->
        <div class="mt-8 mb-4">
          <h2 class="text-lg font-bold !text-white mb-4 flex items-center gap-2">
            <mat-icon class="text-violet-400!">fitness_center</mat-icon>
            Specialized Programs
          </h2>
          <div class="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6" [class.justify-center]="programs.length === 1">
            <div *ngFor="let program of programs" 
                 (click)="openProgramModal(program)"
                 class="flex-shrink-0 w-[280px] sm:w-[320px] bg-slate-800/40 border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-violet-500/50 hover:scale-[1.02] transition-all duration-300 backdrop-blur-xl group">
              <!-- Program Image -->
              <div class="relative h-40 sm:h-44 overflow-hidden">
                <img [src]="program.image" [alt]="program.title" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent"></div>
                <span class="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
                  {{program.type}}
                </span>
                <span class="absolute bottom-3 left-3 text-violet-200 text-xs">
                  {{program.duration}}
                </span>
              </div>
              <!-- Program Details -->
              <div class="p-4 sm:p-5">
                <h3 class="text-base sm:text-lg font-bold text-white! mb-1! group-hover:text-violet-400 transition-colors">{{program.title}}</h3>
                <p class="text-slate-400 text-xs sm:text-sm font-medium mb-3 flex items-center gap-1.5">
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                  {{program.subtitle}}
                </p>
                <div class="flex flex-col gap-2 mb-4">
                  <div *ngFor="let b of program.benefit" class="flex items-center gap-2 bg-violet-500/10 border border-violet-500/15 rounded-xl px-3 py-2">
                    <mat-icon class="text-violet-400 !text-xs !w-3.5 !h-3.5 flex items-center justify-center">star</mat-icon>
                    <span class="text-violet-200 text-[14px] sm:text-xs">{{b}}</span>
                  </div>
                </div>
                <!-- Refund Policy -->
                <div *ngIf="program.refundPolicy" class="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span class="text-emerald-300 text-[11px]">{{program.refundPolicy}}</span>
                </div>
                <!-- Price Section -->
                <div class="flex items-end justify-between">
                  <div>
                    <span class="text-[9px] text-slate-400 font-semibold block uppercase tracking-wider">Starting at</span>
                    <div class="flex items-baseline gap-2">
                      <span class="text-lg sm:text-xl font-extrabold text-emerald-400">₹{{program.price | number}}</span>
                      <span class="text-xs text-slate-400 line-through">₹{{program.originalPrice | number}}</span>
                    </div>
                  </div>
                  <button class="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-3.5 py-2 text-[10px] sm:text-xs transition-all shadow-md group-hover:shadow-violet-900/30">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
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
            [activeMembership]="activeMembership"
            [onboarding]="onboarding"
            [recommendedPlanId]="recommendedPlanId"
            (changeGoal)="openOnboarding()">
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

        <app-shop-trainer (bookSession)="onTrainerBookVisit()"></app-shop-trainer>

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
      
      <!-- Program Details Modal Dialog Overlay -->
      <div *ngIf="selectedProgram" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300">
        <div class="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
          <!-- Close Button -->
          <button (click)="closeProgramModal()" class="absolute top-4 right-4 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-full backdrop-blur-sm transition-all z-10">
            <mat-icon class="!text-xl !w-5 !h-5 flex items-center justify-center">close</mat-icon>
          </button>

          <!-- Image Header -->
          <div class="relative h-56">
            <img [src]="selectedProgram.image" [alt]="selectedProgram.title" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
            <div class="absolute bottom-6 left-6 right-6">
              <span class="bg-black/70 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
                {{selectedProgram.type}}
              </span>
              <h3 class="text-xl font-black text-white! mt-3">{{selectedProgram.title}}</h3>
              <p class="text-slate-300 text-xs font-semibold">{{selectedProgram.subtitle}}</p>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-slate-800/40 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <mat-icon class="!text-lg !w-5 !h-5 flex items-center justify-center">schedule</mat-icon>
                </div>
                <div>
                  <span class="text-[9px] text-slate-400 block font-semibold uppercase">Duration</span>
                  <span class="text-xs text-white">{{selectedProgram.duration}}</span>
                </div>
              </div>
              <div class="bg-slate-800/40 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <mat-icon class="!text-lg !w-5 !h-5 flex items-center justify-center">trending_down</mat-icon>
                </div>
                <div class="min-w-0">
                  <span class="text-[9px] text-slate-400 block font-semibold uppercase">Target Goal</span>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs text-white block truncate">{{selectedProgram.benefit[0]}}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 class="text-xs font-bold text-slate-400! uppercase tracking-wider mb-2!">Program Overview</h4>
              <p class="text-slate-300 text-s leading-relaxed">
                {{selectedProgram.description || 'This comprehensive, goal-oriented training program is tailored to maximize your fitness results. Conducted by expert trainers, it combines progressive training protocols with targeted guidance to ensure you achieve and maintain your goals safely and efficiently.'}}
              </p>
            </div>

            <!-- Refund Policy -->
            <div *ngIf="selectedProgram.refundPolicy" class="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2 flex  items-center gap-3">
              <div class="text-xs text-emerald-300 leading-relaxed">
                {{selectedProgram.refundPolicy}}
              </div>
            </div>

            <!-- Pricing & Action -->
            <div class="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                <span class="text-[9px] text-slate-300 font-semibold block uppercase tracking-wider">Total Investment</span>
                <div class="flex items-baseline gap-2">
                  <span class="text-xl font-black text-emerald-400">₹{{selectedProgram.price | number}}</span>
                  <span class="text-xs text-slate-300! line-through">₹{{selectedProgram.originalPrice | number}}</span>
                </div>
              </div>
              <button (click)="bookProgram(selectedProgram)" class="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs transition-all shadow-lg shadow-violet-900/30">
                Enquire Now
              </button>
            </div>
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
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class ShopDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private shopService = inject(ShopService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  isLoggedIn = false;

  selectedProgram: any = null;
  programs = [
    {
      id: 'shapeshift',
      title: 'ShapeShift Program',
      subtitle: 'Weight Loss',
      duration: '90 days program',
      type: 'Group training',
      benefit: ['Lose up to 15kg', "Build lifelong healthy habits"],
      price: 24000,
      originalPrice: 36000,
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
      refundPolicy: "Not satisfied? We'll refund 100% of your program fee.",
      description: "More than a gym membership ShapeShift is a 90-day transformation system. Train in a small group where everyone shares the same goal, creating motivation and accountability. Follow a personalized diet plan, attend sessions at the same time every day to build discipline, and receive expert guidance throughout your journey. Together, we'll help you lose weight, build healthy habits, and create a lifestyle you can maintain. Only 8 seats available per batch. Please enquire in advance to check availability before planning to join."
    },
    // {
    //   id: 'strength-gain',
    //   title: 'Iron Core Program',
    //   subtitle: 'Strength & Muscle Gain',
    //   duration: '60days program',
    //   type: 'Personal Coaching',
    //   benefit: ['gain up to 5kg lean muscle'],
    //   price: 18000,
    //   originalPrice: 27000,
    //   image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop'
    // },
    // {
    //   id: 'yoga-flex',
    //   title: 'Zen Yoga Program',
    //   subtitle: 'Flexibility & Mind',
    //   duration: '30days program',
    //   type: 'Semi-private Group',
    //   benefit: ['improve flexibility & posture'],
    //   price: 12000,
    //   originalPrice: 18000,
    //   image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop'
    // }
  ];

  activeType: 'products' | 'services' | 'rentals' | 'memberships' = 'memberships';
  shopCode: string | null = null;
  loading = true;
  hasTrialBooking = false;
  hasActiveMembership = false;
  activeMembership: any = null;
  upcomingEvents: any[] = [];

  /** Fitness profile collected in the onboarding wizard (from localStorage). */
  onboarding: any = null;
  /** Plan whose duration best matches the recommended timeline. */
  recommendedPlanId: number | null = null;

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
    rentals: [],
    phone: ''
  };

  ngOnInit() {
    // Pick up the fitness profile collected during the onboarding wizard.
    const savedOnboarding = localStorage.getItem('onboardingFitness');
    if (savedOnboarding) {
      try {
        this.onboarding = JSON.parse(savedOnboarding);
      } catch {
        this.onboarding = null;
      }
    }

    this.route.params.subscribe(params => {
      this.shopCode = params['shopCode'];
      if (this.shopCode) {
        this.fetchShopDetails(this.shopCode);
      }
    });

    // Check login status
    this.isLoggedIn = this.authService.checkAuth();

    // No saved goal yet → run the onboarding wizard so we can recommend a plan.
    if (!this.onboarding) {
      this.openOnboarding();
    }
  }

  /**
   * Open the onboarding wizard, pre-filled with any saved profile so the user
   * can change their goal. On finish, persist the new profile and refresh the
   * recommended plan.
   */
  openOnboarding() {
    const dialogRef = this.dialog.open(OnboardingWizardComponent, {
      data: { phoneRequired: false, prefill: this.onboarding },
      disableClose: !this.onboarding, // must complete when nothing is saved yet
      width: '560px',
      maxWidth: '95vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.fitness) {
        this.onboarding = result.fitness;
        localStorage.setItem('onboardingFitness', JSON.stringify(result.fitness));
        this.computeRecommendedPlan(this.shopData.memberships);
      }
    });
  }

  /** Number of months a plan grants, derived from its first benefit. */
  private planDurationMonths(plan: any): number {
    const b = plan.benefits?.[0];
    if (!b) return 0;
    if (b.durationUnit === 'MONTH') return b.durationValue || 0;
    if (b.durationUnit === 'YEAR') return (b.durationValue || 0) * 12;
    if (b.durationUnit === 'WEEK') return Math.round((b.durationValue || 0) / 4.345);
    if (b.accessDurationInDays) return Math.max(1, Math.round(b.accessDurationInDays / 30));
    return 0;
  }

  /** Pick the plan whose duration best fits the recommended timeline. */
  private computeRecommendedPlan(plans: any[]) {
    const months = this.onboarding?.timelineMonths;
    if (!months || !plans?.length) {
      this.recommendedPlanId = null;
      return;
    }
    const withDuration = plans.filter(p => p.durationMonths > 0);
    if (!withDuration.length) {
      this.recommendedPlanId = null;
      return;
    }
    // Smallest plan that still covers the timeline; else the longest available.
    const covering = withDuration
      .filter(p => p.durationMonths >= months)
      .sort((a, b) => a.durationMonths - b.durationMonths);
    const longest = [...withDuration].sort((a, b) => b.durationMonths - a.durationMonths)[0];
    this.recommendedPlanId = (covering[0] ?? longest).id;
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
          memberships: data.membershipPlans?.map((plan: any) => {
            const durationMonths = this.planDurationMonths(plan);
            return {
              id: plan.id,
              name: plan.name,
              price: plan.basePrice,
              description: plan.description,
              duration: plan.benefits?.[0]?.durationValue ? `${plan.benefits[0].durationValue} ${plan.benefits[0].durationUnit}` : '',
              durationMonths,
              pricePerMonth: durationMonths > 0 ? Math.round(plan.basePrice / durationMonths) : plan.basePrice,
              benefits: plan.benefits
            };
          }) || [],
          services: [],
          products: [],
          reviews: [],
          team: [],
          about: `Welcome to ${data.shopCode}. Contact: ${data.phone}`,
          openingTimes: this.formatOpeningTimes(data.shopHours),
          rentals: [],
          phone: data.phone
        };

        this.computeRecommendedPlan(this.shopData.memberships);
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
    const phone = this.getFormattedPhone();
    window.open(`https://wa.me/${phone}`, '_blank');
  }

  /**
   * Trainer CTA handler. If a plan was recommended for the user's timeline,
   * book a visit for it (same trial flow as the membership cards). Otherwise
   * fall back to WhatsApp.
   */
  onTrainerBookVisit() {
    const plan = (this.shopData.memberships || []).find(
      (p: any) => p.id === this.recommendedPlanId
    );
    if (plan) {
      this.bookTrialForPlan(plan);
    } else {
      const phone = this.getFormattedPhone();
      window.open(`https://wa.me/${phone}`, '_blank');
    }
  }

  /** Book a trial/visit for the given plan (mirrors ShopMembershipComponent). */
  private bookTrialForPlan(plan: any) {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please log in to book a visit.',
        icon: 'info',
        confirmButtonText: 'Login',
        confirmButtonColor: '#7c3aed',
        showCancelButton: true,
        background: '#1e293b',
        color: '#f1f5f9'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    const currentUser = JSON.parse(currentUserStr);
    const firebaseUid = currentUser.firebaseUid;

    if (!firebaseUid) {
      Swal.fire({
        title: 'Error',
        text: 'User unique ID not found. Please log in again.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        background: '#1e293b',
        color: '#f1f5f9'
      });
      return;
    }

    const dialogRef = this.dialog.open(TrialDatePickerDialogComponent, {
      width: '90vw',
      maxWidth: '400px',
      panelClass: 'trial-date-picker-dialog'
    });

    dialogRef.afterClosed().subscribe(selectedDate => {
      if (selectedDate) {
        Swal.fire({
          title: 'Booking Visit...',
          text: 'Please wait while we process your request.',
          allowOutsideClick: false,
          showConfirmButton: false,
          background: '#1e293b',
          color: '#f1f5f9',
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const utcDate = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()));
        const payload = {
          membershipId: plan.id,
          shopCode: this.shopCode,
          requestedDate: utcDate.toISOString()
        };

        this.shopService.bookTrial(plan.id, firebaseUid, payload).subscribe({
          next: () => {
            Swal.fire({
              title: 'Success!',
              text: `Visit booked successfully for ${selectedDate.toLocaleDateString()}!`,
              icon: 'success',
              confirmButtonColor: '#7c3aed',
              background: '#1e293b',
              color: '#f1f5f9'
            });

            // Refresh upcoming events / trial state.
            this.shopService.getCustomerEvents(firebaseUid).subscribe({
              next: (eventsRes: any) => {
                if (eventsRes && eventsRes.data) {
                  this.upcomingEvents = eventsRes.data;
                  this.hasTrialBooking = this.upcomingEvents.some(event =>
                    event.shopDto?.code === this.shopCode && (event.status === 'REQUESTED' || event.status === 'APPROVED' || event.status === 'DECLINED')
                  );
                }
              }
            });
          },
          error: () => {
            Swal.fire({
              title: 'Failed',
              text: 'Failed to book visit. Please try again later.',
              icon: 'error',
              confirmButtonColor: '#ef4444',
              background: '#1e293b',
              color: '#f1f5f9'
            });
          }
        });
      }
    });
  }

  onTypeChange(type: 'products' | 'services' | 'rentals' | 'memberships') {
    this.activeType = type;
  }

  openProgramModal(program: any) {
    this.selectedProgram = program;
  }

  closeProgramModal() {
    this.selectedProgram = null;
  }

  private getFormattedPhone(): string {
    let phone = this.shopData.phone || '917871227902';
    // Remove any non-digit characters
    phone = phone.replace(/\D/g, '');
    if (phone && !phone.startsWith('91')) {
      phone = '91' + phone;
    }
    return phone;
  }

  bookProgram(program: any) {
    this.closeProgramModal();
    const phone = this.getFormattedPhone();
    const message = `Hello, I would like to enquire about the *${program.title}* program.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }
}
