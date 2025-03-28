import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VideoReelComponent } from '../shared/video-reel/video-reel.component';
import { SidePanelComponent } from '../shared/side-panel/side-panel.component';
import { BusinessRequestDialogComponent } from '../business-request-dialog/business-request-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../shared/login-dialog/login-dialog.component';
import { AuthService } from '../../services/auth.service';
import { BookingPanelService } from 'src/app/services/booking-panel.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    VideoReelComponent, 
    SidePanelComponent,
    BusinessRequestDialogComponent
  ],
  template: `
    <div class="product-detail">
      <!-- Image Gallery -->
      <div class="image-gallery">
        <div class="main-image">
          <img [src]="selectedImage" [alt]="product.title">
        </div>
        <div class="thumbnail-list">
          <img *ngFor="let img of product.images" 
               [src]="img" 
               [class.active]="selectedImage === img"
               (click)="selectedImage = img"
               alt="Product thumbnail">
        </div>
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <h1>{{product.title}}</h1>
        <div class="rating">
          <span class="stars">⭐️ {{product.rating}}</span>
          <span>({{product.reviewCount}} reviews)</span>
        </div>
        <p class="location">📍 {{product.location}}</p>
        <div class="price">₹{{product.currentPrice}}</div>
      </div>

      <!-- Consignment Details -->
      <div class="consignment-details">
        <h2>Consignment Details</h2>
        <div class="consignment-grid">
          <div class="detail-item">
            <span class="label">Consignment Size</span>
            <span class="value">{{product.consignmentSize}} {{product.unit}}</span>
          </div>
          <div class="detail-item">
            <span class="label">Booking Progress</span>
            <div class="progress-bar">
              <div class="progress" [style.width.%]="product.bookingProgress"></div>
            </div>
            <span>{{product.bookingProgress}}%</span>
          </div>
          <div class="detail-item">
            <span class="label">Delivery Date</span>
            <span class="value">{{product.deliveryDate | date}}</span>
          </div>
          <div class="detail-item">
            <span class="label">Last Booking Date</span>
            <span class="value">{{product.lastBookingDate | date}}</span>
          </div>
        </div>
      </div>

      <!-- Previous Consignments -->
      <div class="previous-consignments">
        <h2>Previous Consignments</h2>
        <div class="consignment-list">
          <div *ngFor="let consignment of previousConsignments" class="consignment-card">
            <div class="consignment-header">
              <span>Consignment #{{consignment.number}}</span>
              <span class="date">{{consignment.date | date}}</span>
            </div>
            <div class="location-info">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{consignment.location}}</span>
            </div>
            <div class="pricing-details">
              <div class="price-item">
                <span class="label">Original Price</span>
                <span class="value">₹{{consignment.originalPrice}}</span>
              </div>
              <div class="price-item">
                <span class="label">Final Price (After Cashback)</span>
                <span class="value highlight">₹{{consignment.finalPrice}}</span>
              </div>
              <div class="savings">
                <span class="discount-tag">{{consignment.discountPercentage}}% Saved</span>
                <span class="cashback">Cashback: ₹{{consignment.cashbackAmount}}</span>
              </div>
            </div>
            <div class="rating">⭐️ {{consignment.rating}}</div>
            <p class="review">{{consignment.review}}</p>
            <div class="card-footer">
              <button class="review-btn" (click)="showReviews(consignment.number)">
                View All Reviews ({{consignment.totalReviews}})
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews Side Panel -->
      <app-side-panel 
        [isOpen]="isReviewPanelOpen" 
        [title]="'Reviews for Consignment #' + selectedConsignment"
        (closePanel)="closeReviewPanel()">
        <div class="reviews-container">
          <!-- Add Review Form -->
          <div class="add-review-form">
            <h3>Write a Review</h3>
            <div class="star-rating">
              <span 
                *ngFor="let star of [1,2,3,4,5]" 
                class="star"
                [class.filled]="star <= newReview.rating"
                (click)="setRating(star)">
                ★
              </span>
            </div>
            <textarea 
              [(ngModel)]="newReview.comment"
              placeholder="Write your review here..."
              rows="4"
              class="review-input">
            </textarea>
            <button 
              class="submit-review-btn" 
              [disabled]="!newReview.rating || !newReview.comment"
              (click)="submitReview()">
              Submit Review
            </button>
          </div>

          <div class="reviews-divider">All Reviews</div>

          <!-- Existing Reviews List -->
          <div *ngFor="let review of selectedConsignmentReviews" class="review-item">
            <div class="review-header">
              <span class="reviewer">{{review.userName}}</span>
              <span class="rating">⭐️ {{review.rating}}</span>
            </div>
            <p class="review-text">{{review.comment}}</p>
            <span class="review-date">{{review.date | date}}</span>
          </div>
        </div>
      </app-side-panel>

      <!-- Video Reels Section -->
      <app-video-reel></app-video-reel>

      <!-- Booking Section -->
      <div class="booking-section">
        <div class="current-price">
          <span class="label">Current Price</span>
          <span class="price">₹{{product.currentPrice}}</span>
        </div>
        <button class="book-btn" (click)="openBookingDialog()">
          Book Now
        </button>
        <div class="booking-info">
          <p>🕒 Last booking date: {{product.lastBookingDate | date}}</p>
          <p>📦 Available quantity: {{product.consignmentSize - product.bookedQuantity}} {{product.unit}}</p>
          <div class="progress-bar">
            <div class="progress" [style.width.%]="product.bookingProgress"></div>
          </div>
          <p class="progress-text">{{product.bookingProgress}}% Booked</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-detail {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .image-gallery {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 30px;
    }

    .main-image {
      width: 100%;
      height: 400px;
      overflow: hidden;
      border-radius: 8px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .thumbnail-list {
      display: flex;
      gap: 10px;
      overflow-x: auto;

      img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
        cursor: pointer;
        
        &.active {
          border: 2px solid #007bff;
        }
      }
    }

    .product-info {
      margin-bottom: 30px;

      h1 {
        margin-bottom: 15px;
      }

      .rating {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
      }

      .location {
        color: #666;
        margin-bottom: 15px;
      }

      .price {
        font-size: 24px;
        font-weight: bold;
        color: #007bff;
      }
    }

    .consignment-details {
      margin-bottom: 30px;

      .consignment-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }

      .detail-item {
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;

        .label {
          display: block;
          color: #666;
          margin-bottom: 5px;
        }

        .value {
          font-weight: bold;
        }
      }

      .progress-bar {
        width: 100%;
        height: 8px;
        background: #e9ecef;
        border-radius: 4px;
        overflow: hidden;

        .progress {
          height: 100%;
          background: #007bff;
          transition: width 0.3s ease;
        }
      }
    }

    .previous-consignments {
      margin-bottom: 30px;

      .consignment-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }

      .consignment-card {
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;

        .consignment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .date {
          color: #666;
        }

        .location-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          margin: 10px 0;
          padding: 8px;
          background: #f5f5f5;
          border-radius: 4px;
          font-size: 0.9em;

          i {
            color: #dc3545;
          }
        }

        .pricing-details {
          background: #f0f8ff;
          padding: 15px;
          border-radius: 6px;
          margin: 10px 0;

          .price-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;

            .label {
              color: #666;
            }

            .value {
              font-weight: bold;
              
              &.highlight {
                color: #28a745;
              }
            }
          }

          .savings {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
            
            .discount-tag {
              background: #28a745;
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 0.9em;
            }

            .cashback {
              color: #dc3545;
              font-weight: bold;
            }
          }
        }

        .rating {
          margin-bottom: 10px;
        }

        .review {
          color: #444;
        }
      }
    }

    .card-footer {
      margin-top: 15px;
      text-align: right;

      .review-btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        
        &:hover {
          background: #0056b3;
        }
      }
    }

    .reviews-container {
      padding: 20px;

      .add-review-form {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;

        h3 {
          margin-bottom: 15px;
          color: #333;
        }

        .star-rating {
          margin-bottom: 15px;
          
          .star {
            font-size: 24px;
            color: #ddd;
            cursor: pointer;
            transition: color 0.2s;
            
            &:hover {
              color: #ffd700;
            }
            
            &.filled {
              color: #ffd700;
            }
          }
        }

        .review-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 15px;
          resize: vertical;
        }

        .submit-review-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          
          &:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
          
          &:hover:not(:disabled) {
            background: #218838;
          }
        }
      }

      .reviews-divider {
        text-align: center;
        margin: 20px 0;
        position: relative;
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 100%;
          height: 1px;
          background: #ddd;
          z-index: 1;
        }
        
        span {
          background: white;
          padding: 0 15px;
          color: #666;
          position: relative;
          z-index: 2;
        }
      }

      .review-item {
        padding: 15px;
        border-bottom: 1px solid #eee;
        
        .review-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;

          .reviewer {
            font-weight: bold;
          }
        }

        .review-text {
          margin: 10px 0;
          color: #444;
        }

        .review-date {
          color: #666;
          font-size: 0.9em;
        }
      }
    }

    .location-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      margin: 10px 0;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
      font-size: 0.9em;

      i {
        color: #dc3545;
      }
    }

    .booking-section {
      width: 480px;
      margin: auto;
      position: sticky;
      bottom: 0;
      background: white;
      padding: 20px;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
      border-top: 1px solid #eee;
      
      .current-price {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        
        .label {
          color: #666;
        }
        
        .price {
          font-size: 24px;
          font-weight: bold;
          color: #28a745;
        }
      }

      .book-btn {
        width: 100%;
        padding: 15px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.3s;
        
        &:hover {
          background: #0056b3;
        }
      }

      .booking-info {
        margin-top: 15px;
        
        p {
          color: #666;
          margin: 5px 0;
        }

        .progress-bar {
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin: 10px 0;

          .progress {
            height: 100%;
            background: #007bff;
            transition: width 0.3s ease;
          }
        }

        .progress-text {
          text-align: right;
          font-size: 0.9em;
          color: #007bff;
        }
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  productId: string = '';
  selectedImage: string = '';
  
  product = {
    image: 'https://placehold.co/400x300/8884d8/ffffff?text=Coffee+1',
    title: 'Premium Coffee Beans',
    images: [
      'https://placehold.co/400x300/8884d8/ffffff?text=Coffee+1',
      'https://placehold.co/400x300/8884d8/ffffff?text=Coffee+2',
      'https://placehold.co/400x300/8884d8/ffffff?text=Coffee+3',
    ],
    rating: 4.5,
    reviewCount: 128,
    location: 'Mumbai, India',
    currentPrice: 2999,
    consignmentSize: 50,
    unit: 'kgs',
    bookingProgress: 65,
    deliveryDate: new Date('2024-04-15'),
    lastBookingDate: new Date('2024-04-10'),
    bookedQuantity: 30
  };

  isReviewPanelOpen = false;
  selectedConsignment: number = 0;
  selectedConsignmentReviews: any[] = [];

  previousConsignments = [
    {
      number: 2,
      date: new Date('2024-03-15'),
      rating: 4.8,
      review: 'Excellent quality beans, delivered on time. Very satisfied with the purchase.',
      originalPrice: 3499,
      finalPrice: 2799,
      cashbackAmount: 700,
      discountPercentage: 20,
      totalReviews: 45,
      location: 'Mumbai, Maharashtra'
    },
    {
      number: 1,
      date: new Date('2024-02-15'),
      rating: 4.6,
      review: 'Good quality and packaging. Will order again.',
      originalPrice: 3299,
      finalPrice: 2705,
      cashbackAmount: 594,
      discountPercentage: 18,
      totalReviews: 38,
      location: 'Bangalore, Karnataka'
    }
  ];

  newReview = {
    rating: 0,
    comment: ''
  };

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private authService: AuthService,
    private bookingPanelService: BookingPanelService
  ) {
    this.selectedImage = this.product.images[0];
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.productId = params['id'];
      // Here you would typically fetch product details using the ID
    });
  }

  showReviews(consignmentNumber: number) {
    this.selectedConsignment = consignmentNumber;
    // Simulated reviews data - replace with actual API call
    this.selectedConsignmentReviews = [
      {
        userName: 'John Doe',
        rating: 4.8,
        comment: 'Great quality product, very satisfied with the purchase.',
        date: new Date('2024-03-14')
      },
      {
        userName: 'Jane Smith',
        rating: 4.5,
        comment: 'Delivery was on time and product quality was excellent.',
        date: new Date('2024-03-13')
      },
      // Add more reviews as needed
    ];
    this.isReviewPanelOpen = true;
  }

  closeReviewPanel() {
    this.isReviewPanelOpen = false;
  }

  setRating(rating: number) {
    this.newReview.rating = rating;
  }

  submitReview() {
    if (this.newReview.rating && this.newReview.comment) {
      const review = {
        userName: 'Current User', // Replace with actual user name
        rating: this.newReview.rating,
        comment: this.newReview.comment,
        date: new Date()
      };

      // Add to the beginning of the reviews array
      this.selectedConsignmentReviews.unshift(review);

      // Reset form
      this.newReview = {
        rating: 0,
        comment: ''
      };

      // Here you would typically make an API call to save the review
    }
  }
  openBookingPanel() {
    console.log("Opening booking panel with deal:", this.product.title);
    this.bookingPanelService.openPanel({
      image: this.product.image,
      title: this.product.title,
      consignmentSize: this.product.consignmentSize,
      unit: this.product.unit,
      rating: this.product.rating,
      bookingProgress: this.product.bookingProgress,
      bookedQuantity: this.product.bookedQuantity,
      deliveryDate: this.product.deliveryDate,
      lastBookingDate: this.product.lastBookingDate,
      currentPrice: this.product.currentPrice
    });
  }

  openBookingDialog() {
    if (!this.authService.isLoggedIn()) {
      this.dialog.open(LoginDialogComponent, {
        width: '400px'
      }).afterClosed().subscribe(result => {
        if (result === 'success') {
          this.showBusinessRequestDialog();
        }
      });
    } else {
      this.openBookingPanel();
    }
  }

  private showBusinessRequestDialog() {
    this.dialog.open(BusinessRequestDialogComponent, {
      width: '500px',
      data: {
        productId: this.productId,
        product: this.product
      }
    });
  }
} 