import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop-type-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="type-toggle">
      <button 
        [class.active]="activeType === 'products'"
        (click)="onTypeSelect('products')">
        Products
      </button>
      <button 
        [class.active]="activeType === 'services'"
        (click)="onTypeSelect('services')">
        Services
      </button>
      <button 
        [class.active]="activeType === 'rentals'"
        (click)="onTypeSelect('rentals')">
        Rentals
      </button>
    </div>
  `,
  styles: [`
    .type-toggle {
      display: flex;
      gap: 1px;
      background: #eee;
      padding: 4px;
      border-radius: 8px;
      margin: 24px 0;

      button {
        flex: 1;
        padding: 12px 24px;
        border: none;
        background: #f8f8f8;
        cursor: pointer;
        font-weight: 500;
        color: #666;
        transition: all 0.3s ease;

        &:first-child {
          border-radius: 6px 0 0 6px;
        }

        &:last-child {
          border-radius: 0 6px 6px 0;
        }

        &.active {
          background: white;
          color: black;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        &:hover:not(.active) {
          background: #f0f0f0;
        }
      }
    }
  `]
})
export class ShopTypeToggleComponent {
  @Input() activeType: 'products' | 'services' | 'rentals' = 'services';
  @Output() typeChange = new EventEmitter<'products' | 'services' | 'rentals'>();

  onTypeSelect(type: 'products' | 'services' | 'rentals') {
    this.typeChange.emit(type);
  }
} 