import { Component, Input, Inject, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';

import { BookingPanelComponent } from '../booking-panel/booking-panel.component';
import { BookingPanelService } from '../../../services/booking-panel.service';

@Component({
  selector: 'app-deal-card',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatIconModule,
    MatDialogModule,
    LoginDialogComponent,
    BookingPanelComponent
  ],
  template: `
    <div class="deal-card">
      <div class="deal-image">
        <img [src]="deal.image" [alt]="deal.title">
      </div>
      <div class="deal-content">
        <h3 class="title">{{deal.title}}</h3>
        
        <div class="info-row">
          <div class="consignment">
            <span class="size">{{deal.consignmentSize}}</span>
            <span class="unit">{{deal.unit}}</span>
          </div>
          <div class="rating">
            <span class="rating-number">{{deal.rating}}</span>
            <mat-icon class="star-icon">star</mat-icon>
          </div>
        </div>

        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress" [style.width.%]="deal.bookingProgress"></div>
          </div>
          <span class="progress-text">{{deal.bookedQuantity}} booked</span>
        </div>

        <div class="dates">
          <div class="date-item">
            <span class="label">Delivery by</span>
            <span class="value">{{deal.deliveryDate | date:'mediumDate'}}</span>
          </div>
          <div class="date-item">
            <span class="label">Book before</span>
            <span class="value">{{deal.lastBookingDate | date:'mediumDate'}}</span>
          </div>
        </div>

        <div class="price-section">
          <div class="price">₹{{deal.currentPrice}}</div>
          <button class="book-button" (click)="onBook($event)">Book Now</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .deal-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      }

      .deal-image {
        height: 200px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .deal-content {
        padding: 16px;

        .title {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 12px;
          color: #333;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .consignment {
            .size {
              font-size: 24px;
              font-weight: 700;
              color: #333;
            }

            .unit {
              font-size: 16px;
              color: #666;
              margin-left: 4px;
            }
          }

          .rating {
            display: flex;
            align-items: center;
            gap: 2px;

            .rating-number {
              font-size: 20px;
              font-weight: 600;
              color: #333;
            }

            .star-icon {
              color: #FFD700;
              font-size: 20px;
              height: 20px;
              width: 20px;
            }
          }
        }

        .progress-container {
          margin-bottom: 16px;

          .progress-bar {
            height: 8px;
            background: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 4px;

            .progress {
              height: 100%;
              background: #8884d8;
              border-radius: 4px;
            }
          }

          .progress-text {
            font-size: 12px;
            color: #666;
          }
        }

        .dates {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;

          .date-item {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .label {
              font-size: 12px;
              color: #666;
            }

            .value {
              font-size: 14px;
              color: #333;
              font-weight: 500;
            }
          }
        }

        .price-section {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .price {
            font-size: 24px;
            font-weight: 700;
            color: #333;
          }

          .book-button {
            padding: 8px 24px;
            background: #8884d8;
            color: white;
            border: none;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;

            &:hover {
              background: #6c63c7;
            }
          }
        }
      }
    }
  `]
})
export class DealCardComponent {
  @Input() deal!: {
    image: string;
    title: string;
    consignmentSize: number;
    unit: 'kgs' | 'bags';
    rating: number;
    bookingProgress: number;
    bookedQuantity: number;
    deliveryDate: Date;
    lastBookingDate: Date;
    currentPrice: number;
  };

  @ViewChild(BookingPanelComponent) bookingPanel?: BookingPanelComponent;

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private bookingPanelService: BookingPanelService
  ) {}

  onBook(event: Event) {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      const dialogRef = this.dialog.open(LoginDialogComponent, {
        width: '380px'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.openBookingPanel();
        }
      });
    } else {
      this.openBookingPanel();
    }
  }

  openBookingPanel() {
    console.log("Opening booking panel with deal:", this.deal.title);
    this.bookingPanelService.openPanel({
      image: this.deal.image,
      title: this.deal.title,
      consignmentSize: this.deal.consignmentSize,
      unit: this.deal.unit,
      rating: this.deal.rating,
      bookingProgress: this.deal.bookingProgress,
      bookedQuantity: this.deal.bookedQuantity,
      deliveryDate: this.deal.deliveryDate,
      lastBookingDate: this.deal.lastBookingDate,
      currentPrice: this.deal.currentPrice
    });
  }
} 