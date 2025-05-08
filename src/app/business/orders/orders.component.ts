import { Component, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgxTimelineEvent } from '@frxjs/ngx-timeline';
import { CustomerService } from 'src/app/services/customer.service';
import { OrderPanelService } from 'src/app/services/order-panel.service';

export interface Booking {
  vehicleId: number;
  bookingId: number;
  vehicleName: string;
  startDate: string;
  endDate: string;
  totalAmount: number | null;
  status: string;
}
@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent {
  user = {
    image: 'https://cdn.pixabay.com/photo/2017/07/18/23/23/user-2517433_640.png',
    name: 'John Doe',
    phone: '9876543210',
    email: 'john@example.com',
    licenseStatus: 'verified',
    trustScore: 4.5,
    profileStatus: 'pending',
    licenseExpiry: new Date('2025-12-31'),
    criteria: [
      { label: 'License Experience', completed: true },
      { label: 'Profile Verified', completed: false },
      { label: 'ID Proof', completed: true },
      { label: 'Address Proof', completed: false },
      { label: 'Payment Method', completed: true }
    ],
    pastBookings: [
      { date: new Date('2024-03-10'), vehicleName: 'Toyota', rating: 4, revenue: 2500, status: 'Completed', customerReview: 'Great service and clean car!', shopReview: 'Very helpful staff and quick process.', driverReview: 'Driver was punctual and polite.' },
      { date: new Date('2024-02-15'), vehicleName: 'Honda', rating: 5, revenue: 3000, status: 'Canceled', customerReview: 'Booking was canceled but support was responsive.', shopReview: 'Shop handled the cancellation smoothly.', driverReview: 'No driver assigned due to cancellation.' }
    ]
  };

  criteriaFilter: 'all' | 'verified' | 'pending' = 'all';
  filteredCriteria = this.user.criteria;

  setCriteriaFilter(filter: 'all' | 'verified' | 'pending') {
    this.criteriaFilter = filter;
    this.filteredCriteria = this.user.criteria.filter(criterion => {
      if (filter === 'all') return true;
      if (filter === 'verified') return criterion.completed;
      if (filter === 'pending') return !criterion.completed;
      return true;
    });
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  customerService = inject(CustomerService);

  constructor(private orderService: OrderPanelService) {
    this.onFilterChange(this.selectedFilter);
  }

  buffer = false;
  selectedFilter = 'rental';
  displayedColumns: string[] = [
    'bookingId',
    'vehicleName',
    'registerNumber',
    'customerName',
    'phoneNumber',
    'dateRange',
    'status',
    'totalAmount',
    'actions'
  ];
  bookings = new MatTableDataSource<Booking>();

  filters = [
    { value: 'flashbag', label: 'Flashbag Deals' },
    { value: 'services', label: 'Services' },
    { value: 'products', label: 'Products' },
    { value: 'rental', label: 'Rental' }
  ];

  flashbagDeals = [
    {
      id: 1,
      title: 'Electronics Sale',
      date: new Date('2024-03-15'),
      deliveryDate: new Date('2024-03-20'),
      orders: [
        { id: 101, customer: 'John Doe', quantity: 2, total: 599 },
        { id: 102, customer: 'Jane Smith', quantity: 1, total: 299 }
      ]
    },
    {
      id: 2,
      title: 'Fashion Deal',
      date: new Date('2024-03-14'),
      deliveryDate: new Date('2024-03-18'),
      orders: [
        { id: 103, customer: 'Mike Johnson', quantity: 3, total: 150 }
      ]
    }
  ];

  onFilterChange(filter: string) {
    this.buffer = true;
    this.selectedFilter = filter;
    console.log(filter, "Filter Change");
    if (filter == 'rental') {
      this.orderService.getRentalBookings(1).subscribe({
        next: (response) => {
          this.buffer = false;
          if (response.status === 200) {
            this.bookings.data = response.data;
          }
        },
        error: (err) => {
          console.log(err);
          this.buffer = false;
        }
      })
    }
  }

  formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

    const startFormatted = start.toLocaleDateString('en-US', options);
    const endFormatted = end.toLocaleDateString('en-US', options);

    return `${startFormatted} - ${endFormatted}`;
  }

  getCustomerInformation(customerID:number){
    // this.customerService.getCustomer(customerID).subscribe({
    //   next: (response) => {
    //     if (response.status === 200) {
    //       return response.data;
    //     }
    //   },
    //   error: (err) => {
    //     console.log(err);
    //   }
    // })
  }

  //  Side Panel
  isPanelOpen = false;
  openPanel(booking:Booking) {
    this.isPanelOpen = true;
    
  }

  closePanel() {
    this.isPanelOpen = false;
  }

  calculateTotalRevenue(): number {
    return this.user.pastBookings.reduce((total, booking) => total + (booking.revenue || 0), 0);
  }

  activePanel: 'user' | 'car' | 'driver' | 'assignment' = 'user';
  carPastBookings = [
    {
      carImage: 'https://cdn.pixabay.com/photo/2012/05/29/00/43/car-49278_1280.jpg',
      vehicleName: 'Toyota Camry',
      registerNumber: 'TN01AB1234',
      insuranceExpiry: new Date('2025-08-15'),
      kmRun: 45200,
      fcDate: new Date('2026-01-10'),
      date: new Date('2024-03-10'),
      rating: 4,
      revenue: 2500,
      status: 'Completed',
      customerReview: 'Smooth ride and clean car.',
      shopReview: 'Car was well maintained.',
      driverReview: 'Driver was friendly and punctual.'
    },
    {
      carImage: 'https://cdn.pixabay.com/photo/2016/02/19/10/00/car-1209912_1280.jpg',
      vehicleName: 'Honda City',
      registerNumber: 'TN02CD5678',
      insuranceExpiry: new Date('2024-12-01'),
      kmRun: 38900,
      fcDate: new Date('2025-06-20'),
      date: new Date('2024-02-15'),
      rating: 5,
      revenue: 3000,
      status: 'Canceled',
      customerReview: 'Booking was canceled, but car looked great.',
      shopReview: 'Handled cancellation smoothly.',
      driverReview: 'No driver assigned.'
    }
  ];

  events: NgxTimelineEvent[] = [
    {
      timestamp: new Date('2025-05-08T09:00:00'),
      title: 'Booking Created',
      description: '',
    },
    {
      timestamp: new Date('2025-05-09T10:30:00'),
      title: 'Payment Completed',
      description: '',
    },
    {
      timestamp: new Date('2025-05-09T12:00:00'),
      title: 'Waiting For Approval',
      description: '',
    }
  ];

  selectedBooking: typeof this.carPastBookings[0] = this.carPastBookings[0] || null;

  setActivePanel(panel: 'user' | 'car' | 'driver' | 'assignment') {
    this.activePanel = panel;
    // Optionally, set selectedBooking based on context if needed
  }

} 