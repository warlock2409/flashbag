import { Component, inject } from '@angular/core';
import { PosComponent } from '../components/pos/pos.component';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { DashboardService } from 'src/app/services/dashboard.service';
import { ShopModel } from 'src/app/models/shop.model';
import { ResponseDate } from 'src/app/app.component';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false
})
export class HomeComponent {
  onShopChange(arg0: any) {
    throw new Error('Method not implemented.');
  }
  dialog = inject(MatDialog);
  dashboardService = inject(DashboardService);
  orgApiService = inject(OrganizationServiceService);

  shopCategory = new Map<string, string>([
    ['Fitness & Gyms', 'Gym'],
    ['Health & Wellness', 'Spa'],
    ['Restaurants', 'Food & Beverage'],
    ['Electronics', 'Gadgets'],
    // add more mappings here
  ])

  constructor() {
    this.getLocations();
    this.getCurrentUser();
    this.loadGymDashboard();
  }

  isLoading = false;
  shops: ShopModel[] = [];
  fallback = "";
  selectedShop!: ShopModel;
  currentUser: any;

  // Service Model
  activeMemberships: any;
  checkIns: any;
  renewalTrends: any;

  hourlyComparision: any[]= [];

  getCurrentUser() {
    let user = localStorage.getItem('currentUser');
    if (user)
      this.currentUser = JSON.parse(user);
  }

  getLocations() {
    this.isLoading = true;
    this.orgApiService.getLocations().subscribe({
      next: (res: ResponseDate) => {
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
          console.log(this.selectedShop);
          this.selectedShop.shopCategory = this.shopCategory.get(this.selectedShop.primaryIndustry.name) ? this.shopCategory.get(this.selectedShop.primaryIndustry.name) : this.selectedShop.primaryIndustry.name
        }
      },
      error: (err: any) => {
        this.isLoading = false;
      }
    })
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
    forkJoin({
      activeMemberships: this.dashboardService.getActiveMemberships(),
      checkIns: this.dashboardService.getCheckIns(),
      hourlyComparision: this.dashboardService.getHourlyCheckIns(),
      // renewalTrends: this.dashboardService.getRenewalTrends()
    }).subscribe({
      next: (res) => {
        this.activeMemberships = res.activeMemberships.data;
        this.checkIns = res.checkIns.data;
        this.hourlyComparision = res.hourlyComparision.filter(d => d.hour > 4);
      },
      error: (err) => console.error(err)
    });
  }

  // Chart js 

  chartData = [
    { hour: 2, todayMembers: 3, meanMembers: 5 },
    { hour: 1, todayMembers: 3, meanMembers: 5 },
    { hour: 3, todayMembers: 3, meanMembers: 5 },
    { hour: 4, todayMembers: 3, meanMembers: 5 },
    { hour: 5, todayMembers: 3, meanMembers: 5 },
    { hour: 12, todayMembers: 3, meanMembers: 5 },

    { hour: 6, todayMembers: 3, meanMembers: 5 },
    { hour: 7, todayMembers: 10, meanMembers: 8 },
    { hour: 8, todayMembers: 7, meanMembers: 6 },
    { hour: 9, todayMembers: 12, meanMembers: 9 },
    { hour: 10, todayMembers: 12, meanMembers: 9 },
    { hour: 11, todayMembers: 12, meanMembers: 9 },
  ];

} 