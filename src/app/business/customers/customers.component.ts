import { Component } from '@angular/core';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent {
  customers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', orders: 5, lastActive: new Date('2024-03-10 14:30') },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', orders: 3, lastActive: new Date('2024-03-09 09:15') },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', orders: 2, lastActive: new Date('2024-03-08 16:45') }
  ];
} 