import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Deal {
  image: string;
  title: string;
  consignmentSize: number;
  unit: string;
  rating: number;
  bookingProgress: number;
  bookedQuantity: number;
  deliveryDate: Date;
  lastBookingDate: Date;
  currentPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookingPanelService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  private dealSubject = new BehaviorSubject<Deal | null>(null);

  isOpen$ = this.isOpenSubject.asObservable();
  deal$ = this.dealSubject.asObservable();

  openPanel(deal: Deal) {
    this.dealSubject.next(deal);
    this.isOpenSubject.next(true);
  }

  closePanel() {
    this.isOpenSubject.next(false);
    this.dealSubject.next(null);
  }
} 