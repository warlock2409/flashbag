import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { SweatAlertService } from '../../services/sweat-alert.service';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NavbarComponent,
    MatIconModule,
  ]})
export class LandingComponent {
  private placeholderImage = 'https://www.istockphoto.com/resources/images/PhotoFTLP/1035146258.jpg';
  
  // Form data properties
  name: string = '';
  gym: string = '';
  email: string = '';
  phone: string = '';
  city: string = '';
  locations: number = 1;

  categories = [
    { id: 'deals', label: 'Flashbag Deals', active: true },
    // { id: 'services', label: 'Services', active: false },
    // { id: 'products', label: 'Products', active: false },
    // { id: 'rentals', label: 'Rentals', active: false }
  ];

  activeCategory = 'deals';

  constructor(private router: Router, private sweatAlertService: SweatAlertService) {}

  setActiveCategory(categoryId: string) {
    this.activeCategory = categoryId;
    this.categories = this.categories.map(cat => ({
      ...cat,
      active: cat.id === categoryId
    }));
  }

  recommendedItems = [
    {
      id: '1',
      image: this.placeholderImage,
      title: 'Morning Salon & Hair Discovery',
      location: 'New York, NY',
      rating: '4.8'
    },
    {
      id: '2',
      image: this.placeholderImage,
      title: 'StyleHub Salon and Spa',
      location: 'Brooklyn, NY',
      rating: '4.9'
    },
    {
      id: '3',
      image: this.placeholderImage,
      title: 'Wellness Center & Day Spa',
      location: 'Manhattan, NY',
      rating: '4.7'
    },
    {
      id: '4',
      image: this.placeholderImage,
      title: 'Elite Beauty Lounge',
      location: 'Queens, NY',
      rating: '4.6'
    }
  ];

  newItems = [
    {
      id: '5',
      image: this.placeholderImage,
      title: 'Luxury Beauty Spa',
      location: 'Los Angeles, CA',
      rating: '4.9'
    },
    {
      id: '6',
      image: this.placeholderImage,
      title: 'Serenity Wellness Center',
      location: 'San Francisco, CA',
      rating: '4.8'
    },
    {
      id: '7',
      image: this.placeholderImage,
      title: 'Glow Up Beauty Bar',
      location: 'Miami, FL',
      rating: '4.7'
    },
    {
      id: '8',
      image: this.placeholderImage,
      title: 'Pure Bliss Spa & Salon',
      location: 'Chicago, IL',
      rating: '4.8'
    }
  ];

  trendingItems = [
    {
      id: '9',
      image: this.placeholderImage,
      title: 'The Beauty Hub',
      location: 'Seattle, WA',
      rating: '5.0'
    },
    {
      id: '10',
      image: this.placeholderImage,
      title: 'Zen Massage & Wellness',
      location: 'Portland, OR',
      rating: '4.9'
    },
    {
      id: '11',
      image: this.placeholderImage,
      title: 'Radiant Skin Clinic',
      location: 'Austin, TX',
      rating: '4.8'
    },
    {
      id: '12',
      image: this.placeholderImage,
      title: 'Urban Oasis Spa',
      location: 'Denver, CO',
      rating: '4.9'
    }
  ];

  deals = [
    {
      id: '1',
      image: 'https://placehold.co/400x300/8884d8/ffffff?text=Coffee+Beans',
      title: 'Premium Coffee Beans',
      consignmentSize: 50,
      unit: 'kgs' as 'kgs',
      ithConsignment: 3,
      rating: 4.5,
      bookingProgress: 65,
      bookedQuantity: 32,
      deliveryDate: new Date('2024-04-15'),
      lastBookingDate: new Date('2024-04-10'),
      currentPrice: 2999
    },
    {
      id: '2',
      image: 'https://placehold.co/400x300/8884d8/ffffff?text=Green+Tea',
      title: 'Organic Green Tea',
      consignmentSize: 100,
      unit: 'bags' as 'bags',
      ithConsignment: 2,
      rating: 4.2,
      bookingProgress: 45,
      bookedQuantity: 45,
      deliveryDate: new Date('2024-04-20'),
      lastBookingDate: new Date('2024-04-15'),
      currentPrice: 1499
    },
    // Add more deals as needed
  ];

  isPanelOpen = false;

  openPanel() {
    this.isPanelOpen = true;
  }

  closePanel() {
    this.isPanelOpen = false;
  }

  navigateToProduct(productId: string) {
    this.router.navigate(['/product', productId]);
  }
  
  async onSubmit() {
    // Validate required fields
    if (!this.name || !this.gym || !this.email || !this.phone || !this.city) {
      this.sweatAlertService.error('Please fill in all required fields.');
      return;
    }
    
    if (!this.isValidEmail(this.email)) {
      this.sweatAlertService.error('Please enter a valid email address.');
      return;
    }
    
    if (!this.isValidPhone(this.phone)) {
      this.sweatAlertService.error('Please enter a valid Indian phone number (6-9 followed by 9 digits).');
      return;
    }
    
    // Prepare the lead data
    const leadData = {
      name: this.name,
      gym: this.gym,
      email: this.email,
      phone: this.phone,
      city: this.city,
      locations: this.locations
    };
    
    try {
      const success = await this.sweatAlertService.sendLeadWithDetails(leadData);
      if (success) {
        this.sweatAlertService.success('Thank you for connecting with us!');
        
        // Clear all form fields
        this.name = '';
        this.gym = '';
        this.email = '';
        this.phone = '';
        this.city = '';
        this.locations = 1;
        
        // Show success message
        const leadNote = document.getElementById('leadNote') as HTMLElement;
        if (leadNote) {
          leadNote.classList.remove('hidden');
        }
      } else {
        this.sweatAlertService.error('Failed to submit your request. Please try again.');
      }
    } catch (error) {
      this.sweatAlertService.error('An error occurred while submitting your request. Please try again.');
    }
  }
  
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[6-9][0-9]{9}$/;
    return phoneRegex.test(phone);
  }
  
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}