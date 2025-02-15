import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

@Component({
  selector: 'app-shop-reviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reviews-section">
      <h2>Reviews</h2>
      <div class="reviews-list">
        <div *ngFor="let review of reviews" class="review-item">
          <div class="review-header">
            <img [src]="review.avatar || 'assets/default-avatar.png'" [alt]="review.author">
            <div class="review-meta">
              <div class="author">{{review.author}}</div>
              <div class="rating">{{review.rating}} ★</div>
              <div class="date">{{review.date}}</div>
            </div>
          </div>
          <p class="comment">{{review.comment}}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reviews-section {
      padding: 24px 0;

      h2 {
        margin-bottom: 24px;
      }

      .reviews-list {
        display: grid;
        gap: 24px;

        .review-item {
          padding: 16px;
          border-radius: 8px;
          background: #f8f8f8;

          .review-header {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;

            img {
              width: 48px;
              height: 48px;
              border-radius: 50%;
              object-fit: cover;
            }

            .review-meta {
              .author {
                font-weight: 500;
              }
              .rating {
                color: #FFD700;
              }
              .date {
                color: #666;
                font-size: 14px;
              }
            }
          }

          .comment {
            color: #333;
            line-height: 1.5;
          }
        }
      }
    }
  `]
})
export class ShopReviewsComponent {
  @Input() reviews: Review[] = [];
} 