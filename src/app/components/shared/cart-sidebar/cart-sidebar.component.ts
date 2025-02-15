import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="cart-sidebar" [class.open]="isOpen">
      <div class="cart-header">
        <h3>Shopping Cart</h3>
        <button class="close-btn" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <div class="cart-items">
        <!-- Cart items will go here -->
      </div>
    </div>
    <div class="overlay" [class.open]="isOpen" (click)="close()"></div>
  `,
  styles: [`
    .cart-sidebar {
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100vh;
      background: white;
      box-shadow: -2px 0 8px rgba(0,0,0,0.1);
      transition: right 0.3s ease;
      z-index: 1001;

      &.open {
        right: 0;
      }
    }

    .cart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #eee;

      h3 {
        margin: 0;
        font-size: 18px;
        color: #333;
      }

      .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: #666;
        padding: 4px;

        &:hover {
          color: #333;
        }
      }
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.5);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 1000;

      &.open {
        opacity: 1;
        visibility: visible;
      }
    }
  `]
})
export class CartSidebarComponent {
  isOpen = false;

  open() {
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    document.body.style.overflow = 'auto';
  }
} 