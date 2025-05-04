import { Component, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
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

} 