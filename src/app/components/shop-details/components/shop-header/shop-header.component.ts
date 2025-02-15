import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ShopData {
  name: string;
  rating: string;
  totalReviews: number;
  images: string[];
  location: string;
}

@Component({
  selector: 'app-shop-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="shop-header">
      <div class="image-gallery">
        <img [src]="shopData.images[0]" alt="Main shop image" class="main-image">
        <div class="small-images">
          <img *ngFor="let img of shopData.images.slice(1)" [src]="img" [alt]="shopData.name">
        </div>
      </div>
      <div class="shop-info">
        <h1>{{shopData.name}}</h1>
        <div class="rating">
          <span class="stars">★★★★★</span>
          <span>{{shopData.rating}} ({{shopData.totalReviews}} reviews)</span>
        </div>
        <p class="location">{{shopData.location}}</p>
      </div>
    </div>
  `,
  styles: [`
    .shop-header {
      margin-bottom: 24px;

      .image-gallery {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 12px;
        margin-bottom: 24px;

        .main-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
          border-radius: 8px;
        }

        .small-images {
          display: grid;
          grid-template-rows: repeat(2, 1fr);
          gap: 12px;

          img {
            width: 100%;
            height: 194px;
            object-fit: cover;
            border-radius: 8px;
          }
        }
      }

      .shop-info {
        h1 {
          font-size: 24px;
          margin-bottom: 12px;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;

          .stars {
            color: #FFD700;
          }
        }

        .location {
          color: #666;
        }
      }
    }
  `]
})
export class ShopHeaderComponent {
  @Input() shopData!: ShopData;
} 