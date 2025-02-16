import { Component } from '@angular/core';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent {
  selectedFilter = 'flashbag';
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
    this.selectedFilter = filter;
  }
} 