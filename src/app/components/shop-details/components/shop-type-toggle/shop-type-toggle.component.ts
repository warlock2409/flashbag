import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop-type-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="type-toggle">
      <button 
        *ngIf="hasMemberships"
        [class.active]="activeType === 'memberships'"
        (click)="onTypeSelect('memberships')">
        Memberships
      </button>
      <button 
        *ngIf="hasProducts"
        [class.active]="activeType === 'products'"
        (click)="onTypeSelect('products')">
        Products
      </button>
      <button 
        *ngIf="hasServices"
        [class.active]="activeType === 'services'"
        (click)="onTypeSelect('services')">
        Services
      </button>
      <button 
        *ngIf="hasRentals"
        [class.active]="activeType === 'rentals'"
        (click)="onTypeSelect('rentals')">
        Rentals
      </button>
    </div>
  `,
  styles: [`
    .type-toggle {
      width: 100%;
      box-sizing: border-box;
      display: flex;
      gap: 1px;
      background: #1e293b;
      padding: 4px;
      border-radius: 12px;
      margin: 24px 0;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      &::-webkit-scrollbar {
        display: none;
      }

      button {
        flex: 1;
        min-width: 120px;
        padding: 12px 24px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-weight: 500;
        color: #94a3b8;
        transition: all 0.3s ease;

        &.active {
          background: #334155;
          color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        &:hover:not(.active) {
          color: white;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
        }
      }
    }
  `]
})
export class ShopTypeToggleComponent {
  @Input() activeType: 'products' | 'services' | 'rentals' | 'memberships' = 'memberships';
  @Input() hasProducts = false;
  @Input() hasServices = false;
  @Input() hasRentals = false;
  @Input() hasMemberships = true;

  @Output() typeChange = new EventEmitter<'products' | 'services' | 'rentals' | 'memberships'>();

  onTypeSelect(type: 'products' | 'services' | 'rentals' | 'memberships') {
    this.typeChange.emit(type);
  }
} 