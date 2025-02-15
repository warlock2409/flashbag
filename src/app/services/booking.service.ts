import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type BookingStep = 'cart' | 'payment' | 'confirmation';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  currentStepSubject = new BehaviorSubject<BookingStep>('cart');
  currentStep$ = this.currentStepSubject.asObservable();

  setStep(step: BookingStep) {
    this.currentStepSubject.next(step);
  }

  resetFlow() {
    this.currentStepSubject.next('cart');
  }
} 