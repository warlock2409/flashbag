import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-discount-dialog',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './discount-dialog.component.html',
  styleUrls: ['./discount-dialog.component.scss']
})
export class DiscountDialogComponent {
  private _snackBar = inject(NzMessageService);
  
  activeTab = 0; // 0: Manual, 1: Coupon, 2: Promo
  
  // Manual discount
  manualDiscountAmount: number | null = null;
  
  // Coupon codes (locked)
  availableCoupons = [
    { code: 'WELCOME10', description: '10% off for new customers', discountType: 'percentage', value: 10, locked: true },
    { code: 'SUMMER20', description: '20% off summer sale', discountType: 'percentage', value: 20, locked: true },
    { code: 'FLAT500', description: '₹500 off on orders above ₹2000', discountType: 'fixed', value: 500, locked: true }
  ];
  
  // Promo offers (locked)
  availablePromos = [
    { code: 'FIRSTORDER', description: 'Special offer for first order', discountType: 'percentage', value: 15, locked: true },
    { code: 'LOYALTY25', description: 'Loyalty member exclusive', discountType: 'percentage', value: 25, locked: true },
    { code: 'WEEKEND100', description: 'Weekend special discount', discountType: 'fixed', value: 100, locked: true }
  ];

  constructor(
    public dialogRef: MatDialogRef<DiscountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { subtotal: number, currentDiscount: number }
  ) {
    this.manualDiscountAmount = data.currentDiscount || null;
  }

  applyManualDiscount() {
    if (this.manualDiscountAmount === null || this.manualDiscountAmount === undefined) {
      this._snackBar.error('Please enter a valid discount amount');
      return;
    }

    if (this.manualDiscountAmount < 0) {
      this._snackBar.error('Discount amount cannot be negative');
      return;
    }
    
    if (this.manualDiscountAmount > this.data.subtotal) {
      this._snackBar.error('Discount cannot exceed subtotal amount');
      return;
    }
    
    this.dialogRef.close({
      type: 'manual',
      amount: this.manualDiscountAmount
    });
  }

  applyCoupon(coupon: any) {
    if (coupon.locked) {
      this._snackBar.info('This coupon is currently locked');
      return;
    }
    
    this.dialogRef.close({
      type: 'coupon',
      code: coupon.code,
      amount: this.calculateDiscountAmount(coupon)
    });
  }

  applyPromo(promo: any) {
    if (promo.locked) {
      this._snackBar.info('This promo is currently locked');
      return;
    }
    
    this.dialogRef.close({
      type: 'promo',
      code: promo.code,
      amount: this.calculateDiscountAmount(promo)
    });
  }

  calculateDiscountAmount(offer: any): number {
    if (offer.discountType === 'percentage') {
      return (this.data.subtotal * offer.value) / 100;
    } else {
      return offer.value;
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
