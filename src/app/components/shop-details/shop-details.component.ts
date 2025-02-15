import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopHeaderComponent } from './components/shop-header/shop-header.component';
import { ShopTypeToggleComponent } from './components/shop-type-toggle/shop-type-toggle.component';
import { ShopServicesComponent } from './components/shop-services/shop-services.component';
import { ShopTeamComponent } from './components/shop-team/shop-team.component';
import { ShopReviewsComponent } from './components/shop-reviews/shop-reviews.component';
import { ShopAboutComponent } from './components/shop-about/shop-about.component';
import { ShopProductsComponent } from './components/shop-products/shop-products.component';
import { ShopRentalsComponent } from './components/shop-rentals/shop-rentals.component';

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
    ShopAboutComponent
  ],
  template: `
    <div class="shop-details">
      <app-shop-header [shopData]="shopData"></app-shop-header>
      
      <app-shop-type-toggle 
        [activeType]="activeType"
        (typeChange)="onTypeChange($event)">
      </app-shop-type-toggle>

      <ng-container [ngSwitch]="activeType">
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

      <app-shop-team [team]="shopData.team"></app-shop-team>
      <app-shop-reviews [reviews]="shopData.reviews"></app-shop-reviews>
      <app-shop-about 
        [about]="shopData.about"
        [openingTimes]="shopData.openingTimes"
        [location]="shopData.location">
      </app-shop-about>
    </div>
  `,
  styles: [`
    .shop-details {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }
  `]
})
export class ShopDetailsComponent {
  activeType: 'products' | 'services' | 'rentals' = 'services';
  
  shopData = {
    name: 'Trimmings Salon & Spa | Dempsey Hill',
    rating: '4.8',
    totalReviews: 2453,
    images: [
      'https://www.istockphoto.com/resources/images/PhotoFTLP/1035146258.jpg',
      'https://www.istockphoto.com/resources/images/PhotoFTLP/1035146258.jpg',
      'https://www.istockphoto.com/resources/images/PhotoFTLP/1035146258.jpg'
    ],
    location: 'Dempsey Hill, Singapore',
    services: [
      {
        name: 'Haircut & Style',
        duration: '45 mins',
        price: 75,
        description: 'Includes consultation, shampoo, and styling'
      },
      {
        name: 'Color Treatment',
        duration: '120 mins',
        price: 150,
        description: 'Full color treatment with premium products'
      }
    ],
    reviews: [
      {
        id: '1',
        author: 'John Doe',
        rating: 5,
        comment: 'Great service and friendly staff!',
        date: '2024-03-15',
        avatar: 'https://www.istockphoto.com/resources/images/PhotoFTLP/1035146258.jpg'
      }
    ],
    team: [
      {
        name: 'Jane Smith',
        role: 'Senior Stylist',
        avatar: 'https://www.istockphoto.com/resources/images/PhotoFTLP/1035146258.jpg'
      },
      {
        name: 'Mike Johnson',
        role: 'Color Specialist',
        avatar: 'https://www.istockphoto.com/resources/images/PhotoFTLP/1035146258.jpg'
      }
    ],
    about: 'Premier salon offering high-end beauty and wellness services.',
    openingTimes: [
      { day: 'Monday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Tuesday', hours: '9:00 AM - 6:00 PM' }
    ],
    products: [
      {
        name: 'Hair Care Kit',
        price: 45,
        description: 'Professional hair care products'
      },
      {
        name: 'Styling Tools',
        price: 89,
        description: 'Professional styling equipment'
      }
    ],
    rentals: [
      {
        name: 'Professional Hair Dryer',
        price: 25,
        duration: '1 day',
        description: 'High-end salon equipment'
      }
    ]
  };

  onTypeChange(type: 'products' | 'services' | 'rentals') {
    this.activeType = type;
  }
} 