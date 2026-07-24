import { Component, Input, HostListener } from '@angular/core';
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
        <img [src]="shopData.images[0]" alt="Main shop image" class="main-image" (click)="openZoom(0)">
        <div class="small-images">
          <img *ngFor="let img of shopData.images.slice(1); let i = index"
               [src]="img" [alt]="shopData.name" (click)="openZoom(i + 1)">
        </div>
      </div>
      <div class="shop-info">
        <h1>{{shopData.name}}</h1>
        <div class="rating">
          <span class="stars">★★★★★</span>
          <span>4.5 (14 reviews)</span>
        </div>
        <p class="location">{{shopData.location}}</p>
      </div>
    </div>

    <!-- Zoom / lightbox overlay -->
    <div *ngIf="zoomIndex !== null" class="image-zoom-overlay" (click)="closeZoom()">
      <button type="button" class="zoom-btn zoom-close" (click)="closeZoom()">&times;</button>

      <button type="button" class="zoom-btn zoom-prev"
              *ngIf="shopData.images.length > 1" (click)="prevZoom($event)">&#8249;</button>

      <img class="zoom-image" [src]="shopData.images[zoomIndex]" [alt]="shopData.name"
           (click)="$event.stopPropagation()">

      <button type="button" class="zoom-btn zoom-next"
              *ngIf="shopData.images.length > 1" (click)="nextZoom($event)">&#8250;</button>

      <span class="zoom-counter">{{ zoomIndex + 1 }} / {{ shopData.images.length }}</span>
    </div>
  `,
  styles: [`
    .shop-header {
      width: 100%;
      margin-bottom: 24px;

      .image-gallery {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 12px;
        margin-bottom: 24px;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .main-image {
          width: 100%;
          height: 300px;
          @media (min-width: 768px) {
            height: 400px;
          }
          object-fit: cover;
          border-radius: 8px;
          cursor: zoom-in;
          transition: opacity 0.2s ease;

          &:hover {
            opacity: 0.9;
          }
        }

        .small-images {
          display: grid;
          grid-template-rows: repeat(2, 1fr);
          gap: 12px;

          @media (max-width: 768px) {
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: none;
            gap: 8px;
          }

          img {
            width: 100%;
            height: 146px;
            @media (min-width: 768px) {
              height: 194px;
            }
            object-fit: cover;
            border-radius: 8px;
            cursor: zoom-in;
            transition: opacity 0.2s ease;

            &:hover {
              opacity: 0.9;
            }
          }
        }
      }

      .shop-info {
        h1 {
          font-size: 24px;
          margin-bottom: 12px;
          color: #f8fafc;
          font-weight: 700;
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
          color: #c4cec6ff;
        }
      }
    }

    .image-zoom-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;

      .zoom-image {
        max-height: 85vh;
        max-width: 90vw;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
      }

      .zoom-btn {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        cursor: pointer;
        transition: background 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }

      .zoom-close {
        top: 16px;
        right: 16px;
        width: 40px;
        height: 40px;
        font-size: 26px;
        line-height: 1;
      }

      .zoom-prev,
      .zoom-next {
        top: 50%;
        transform: translateY(-50%);
        width: 44px;
        height: 44px;
        font-size: 26px;
      }

      .zoom-prev { left: 12px; }
      .zoom-next { right: 12px; }

      .zoom-counter {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        color: rgba(255, 255, 255, 0.8);
        font-size: 12px;
        font-weight: 500;
      }
    }
  `]
})
export class ShopHeaderComponent {
  @Input() shopData!: ShopData;

  zoomIndex: number | null = null;

  openZoom(index: number): void {
    this.zoomIndex = index;
  }

  closeZoom(): void {
    this.zoomIndex = null;
  }

  nextZoom(event: Event): void {
    event.stopPropagation();
    if (this.zoomIndex === null) return;
    this.zoomIndex = (this.zoomIndex + 1) % this.shopData.images.length;
  }

  prevZoom(event: Event): void {
    event.stopPropagation();
    if (this.zoomIndex === null) return;
    const len = this.shopData.images.length;
    this.zoomIndex = (this.zoomIndex - 1 + len) % len;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.zoomIndex === null) return;
    if (event.key === 'Escape') this.closeZoom();
    else if (event.key === 'ArrowRight') this.nextZoom(event);
    else if (event.key === 'ArrowLeft') this.prevZoom(event);
  }
}