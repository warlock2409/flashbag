import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, MatTabsModule],
  template: `
    <div class="product-details">
      <!-- Image Gallery -->
      <section class="gallery">
        <div class="main-image">
          <img [src]="selectedImage" [alt]="product.name">
        </div>
        <div class="thumbnails">
          <img *ngFor="let image of product.images" 
               [src]="image" 
               (click)="selectedImage = image"
               [class.active]="selectedImage === image">
        </div>
      </section>

      <!-- Product Info -->
      <section class="info">
        <div class="header">
          <h1>{{product.name}}</h1>
          <div class="price">₹{{product.price}}</div>
        </div>
        <div class="rating">
          <span class="stars">⭐ {{product.rating}}</span>
          <span class="reviews">({{product.reviewCount}} reviews)</span>
        </div>
        <p class="seller">Sold by: {{product.seller}}</p>
        <div class="stock" [class.low]="product.stock < 10">
          {{product.stock}} items left
        </div>
      </section>

      <!-- Tabs Section -->
      <mat-tab-group>
        <mat-tab label="Description">
          <div class="tab-content">
            <h3>Product Details</h3>
            <p>{{product.description}}</p>
            <div class="specifications">
              <h4>Specifications</h4>
              <ul>
                <li *ngFor="let spec of product.specifications">
                  {{spec}}
                </li>
              </ul>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Reviews">
          <div class="tab-content reviews">
            <div *ngFor="let review of product.reviews" class="review-card">
              <div class="review-header">
                <span class="stars">⭐ {{review.rating}}</span>
                <span class="date">{{review.date | date}}</span>
              </div>
              <p class="comment">{{review.comment}}</p>
              <p class="author">- {{review.author}}</p>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Related Products">
          <div class="tab-content related-products">
            <div class="product-grid">
              <!-- Add related products grid here -->
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .product-details {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .gallery {
      margin-bottom: 24px;

      .main-image {
        width: 100%;
        height: 400px;
        overflow: hidden;
        border-radius: 8px;
        margin-bottom: 16px;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #f8f8f8;
        }
      }

      .thumbnails {
        display: flex;
        gap: 8px;
        overflow-x: auto;

        img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;

          &.active, &:hover {
            opacity: 1;
          }
        }
      }
    }

    .info {
      margin-bottom: 24px;
      padding: 20px;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h1 {
          margin: 0;
          font-size: 24px;
        }

        .price {
          font-size: 24px;
          font-weight: bold;
          color: #e65100;
        }
      }

      .rating {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 8px;
      }

      .seller {
        color: #666;
        margin: 8px 0;
      }

      .stock {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        background: #e8f5e9;
        color: #2e7d32;

        &.low {
          background: #fff3e0;
          color: #e65100;
        }
      }
    }

    .tab-content {
      padding: 24px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-top: 16px;

      .specifications {
        margin-top: 16px;

        ul {
          list-style: none;
          padding: 0;

          li {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
        }
      }
    }

    .reviews {
      .review-card {
        padding: 16px;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .comment {
          margin: 8px 0;
          color: #333;
        }

        .author {
          color: #666;
          font-style: italic;
        }
      }
    }
  `]
})
export class ProductDetailsComponent {
  selectedImage: string = '';

  product = {
    id: 1,
    name: 'Premium Hair Dryer',
    price: 1299,
    rating: 4.5,
    reviewCount: 128,
    seller: 'Beauty Pro Shop',
    stock: 15,
    description: 'Professional-grade hair dryer with multiple heat settings...',
    specifications: [
      'Power: 2000W',
      'Heat Settings: 3',
      'Speed Settings: 2',
      'Cool Shot Button',
      'Ionic Technology'
    ],
    images: [
      'assets/product1.jpg',
      'assets/product2.jpg',
      'assets/product3.jpg',
    ],
    reviews: [
      {
        rating: 5,
        comment: 'Excellent product, dries hair quickly without damage',
        author: 'Sarah M.',
        date: new Date('2024-03-01')
      },
      // Add more reviews
    ]
  };

  ngOnInit() {
    this.selectedImage = this.product.images[0];
  }
} 