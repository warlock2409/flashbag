import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface OrderTimeline {
  date: Date;
  status: string;
  icon: string;
}

export interface Order {
  id: string;
  type: 'product' | 'service' | 'rental';
  title: string;
  price: number;
  timeline: OrderTimeline[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderPanelService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpenSubject.asObservable();

  mockOrders: Order[] = [
    {
      id: 'ORD001',
      type: 'product',
      title: 'Premium Coffee Beans',
      price: 2999,
      timeline: [
        {
          date: new Date('2024-03-15T10:00:00'),
          status: 'Order Placed',
          icon: 'shopping_cart'
        },
        {
          date: new Date('2024-03-15T10:30:00'),
          status: 'Order Confirmed',
          icon: 'check_circle'
        },
        {
          date: new Date('2024-03-16T14:20:00'),
          status: 'Shipped',
          icon: 'local_shipping'
        },
        {
          date: new Date('2024-03-18T11:45:00'),
          status: 'Delivered',
          icon: 'done_all'
        }
      ]
    },
    {
      id: 'ORD002',
      type: 'service',
      title: 'Spa Treatment',
      price: 1499,
      timeline: [
        {
          date: new Date('2024-03-20T09:00:00'),
          status: 'Booking Confirmed',
          icon: 'event_available'
        },
        {
          date: new Date('2024-03-20T15:00:00'),
          status: 'Service Completed',
          icon: 'check_circle'
        }
      ]
    },
    {
      id: 'ORD003',
      type: 'rental',
      title: 'Camera Equipment',
      price: 4999,
      timeline: [
        {
          date: new Date('2024-03-10T11:00:00'),
          status: 'Rental Booked',
          icon: 'calendar_today'
        },
        {
          date: new Date('2024-03-12T09:00:00'),
          status: 'Equipment Picked Up',
          icon: 'handshake'
        },
        {
          date: new Date('2024-03-15T18:00:00'),
          status: 'Equipment Returned',
          icon: 'assignment_turned_in'
        }
      ]
    }
  ];

  getOrders(): Order[] {
    return this.mockOrders;
  }

  openPanel() {
    this.isOpenSubject.next(true);
  }

  closePanel() {
    this.isOpenSubject.next(false);
  }
} 