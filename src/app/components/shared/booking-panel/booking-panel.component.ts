import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { BookingService } from '../../../services/booking.service';
import { SidePanelComponent } from '../side-panel/side-panel.component';
import { BookingPanelService } from '../../../services/booking-panel.service';

interface Deal {
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

@Component({
  selector: 'app-booking-panel',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatStepperModule,
    SidePanelComponent
  ],
  template: `
    <app-side-panel 
      [isOpen]="isOpen" 
      [title]="getPanelTitle()"
      (closePanel)="close()"
      [panelStyles]="{ 'top': '0' }"
      >
      
      <div class="booking-steps">
        <div [ngSwitch]="currentStep$ | async">
          
          <!-- Cart Step -->
          <div *ngSwitchCase="'cart'" class="step-content">
            <div class="cart-items">
              <div class="cart-item">
                <div class="item-image">
                  <img [src]="deal?.image" [alt]="deal?.title">
                </div>
                <div class="item-details">
                  <h4>{{ deal?.title }}</h4>
                  <p class="price">₹{{ deal?.currentPrice }}</p>
                </div>
                <div class="quantity-controls">
                  <button (click)="decreaseQty()" [disabled]="quantity <= 1">−</button>
                  <span>{{ quantity }}</span>
                  <button (click)="increaseQty()">+</button>
                </div>
              </div>
            </div>

            <div class="cart-summary">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>₹{{(deal?.currentPrice || 0) * quantity}}</span>
              </div>
              <div class="summary-row">
                <span>Shipping Fee</span>
                <span>₹9.99</span>
              </div>
              <div class="summary-row total">
                <span>Total</span>
                <span>₹{{((deal?.currentPrice || 0) * quantity) + 9.99}}</span>
              </div>
              <button class="confirm-btn" (click)="nextStep()">
                Confirm Order
              </button>
            </div>
          </div>

          <!-- Payment Step -->
          <div *ngSwitchCase="'payment'" class="step-content">
            <div class="payment-methods">
              <h4>Select Payment Method</h4>
              <div class="method" 
                   *ngFor="let method of paymentMethods"
                   [class.selected]="selectedPayment === method.id"
                   (click)="selectPayment(method.id)">
                <mat-icon>{{ method.icon }}</mat-icon>
                <span>{{ method.name }}</span>
              </div>
            </div>
            <button class="proceed-btn" 
                    [disabled]="!selectedPayment"
                    (click)="processPayment()">
              Pay Now
            </button>
          </div>

          <!-- Confirmation Step -->
          <div *ngSwitchCase="'confirmation'" class="step-content">
            <div class="confirmation">
              <mat-icon class="success">check_circle</mat-icon>
              <h4>Booking Confirmed!</h4>
              <p>Your order has been successfully placed.</p>
              <button class="close-btn" (click)="close()">
                Done
              </button>
            </div>
          </div>

        </div>
      </div>
    </app-side-panel>
  `,
  styles: [`
    .booking-steps {
      height: 100%;
    }

    .step-content {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .cart-items {
      padding: 16px;
    }

    .cart-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);

      .item-image {
        width: 80px;
        height: 80px;
        border-radius: 4px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .item-details {
        flex: 1;

        h4 {
          margin: 0 0 8px;
          font-size: 16px;
          color: #333;
        }

        .price {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
      }

      .quantity-controls {
        display: flex;
        align-items: center;
        gap: 12px;
        
        button {
          width: 28px;
          height: 28px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          
          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }

        span {
          min-width: 20px;
          text-align: center;
        }
      }
    }

    .cart-summary {
      position: sticky;
      bottom: 0;
      background: white;
      padding: 16px;
      border-top: 1px solid #eee;

      .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        color: #666;

        &.total {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #eee;
          font-weight: 600;
          color: #333;
          font-size: 18px;
        }
      }

      .confirm-btn {
        width: 100%;
        padding: 16px;
        background: #8884d8;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        margin-top: 16px;

        &:hover {
          background: #6c63c7;
        }
      }
    }

    .payment-methods {
      .method {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 12px;
        cursor: pointer;

        &.selected {
          border-color: #8884d8;
          background: rgba(136,132,216,0.1);
        }
      }
    }

    .proceed-btn {
      margin-top: auto;
      padding: 16px;
      background: #8884d8;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:disabled {
        background: #ddd;
        cursor: not-allowed;
      }
    }

    .confirmation {
      text-align: center;
      padding: 40px 20px;

      .success {
        font-size: 64px;
        color: #4CAF50;
        margin-bottom: 20px;
      }

      h4 {
        font-size: 24px;
        margin-bottom: 12px;
      }

      .close-btn {
        margin-top: 20px;
        padding: 12px 24px;
        background: #8884d8;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    }
  `]
})
export class BookingPanelComponent implements OnInit {
  isOpen = false;
  currentStep$ = this.bookingService.currentStep$;
  deal: Deal | null = null;
  quantity = 1;
  selectedPayment: string | null = null;

  paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'credit_card' },
    { id: 'upi', name: 'UPI', icon: 'phone_android' },
    { id: 'netbanking', name: 'Net Banking', icon: 'account_balance' }
  ];

  constructor(
    private bookingService: BookingService,
    private bookingPanelService: BookingPanelService
  ) {}

  ngOnInit() {
    this.bookingPanelService.isOpen$.subscribe(
      isOpen => this.isOpen = isOpen
    );
    
    this.bookingPanelService.deal$.subscribe(
      deal => this.deal = deal
    );
  }

  getPanelTitle() {
    switch (this.bookingService.currentStepSubject.getValue()) {
      case 'cart': return 'Shopping Cart';
      case 'payment': return 'Payment';
      case 'confirmation': return 'Order Confirmation';
      default: return 'Booking';
    }
  }

  close() {
    this.bookingPanelService.closePanel();
    this.bookingService.resetFlow();
    this.quantity = 1;
    this.selectedPayment = null;
  }

  nextStep() {
    this.bookingService.setStep('payment');
  }

  selectPayment(methodId: string) {
    this.selectedPayment = methodId;
  }

  processPayment() {
    // Mock payment processing
    setTimeout(() => {
      this.bookingService.setStep('confirmation');
    }, 1500);
  }

  increaseQty() {
    this.quantity++;
  }

  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
} 