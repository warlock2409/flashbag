import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ShopService } from 'src/app/services/shop.service';

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
  private shopService = inject(ShopService);

  activeTab = 0; // 0: Manual, 1: Coupon, 2: Promo

  // Manual discount
  manualDiscountAmount: number | null = null;

  // Coupon codes
  availableCoupons: any[] = [];
  loadingCoupons = false;

  // Promo offers
  availablePromos: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<DiscountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { subtotal: number, currentDiscount: number, customerId?: number, shopCode?: string }
  ) {
    this.manualDiscountAmount = data.currentDiscount || null;
  }

  ngOnInit() {
    if (this.data.customerId && this.data.shopCode) {
      this.fetchCoupons();
    }
  }

  fetchCoupons() {
    console.log(this.data);
    this.loadingCoupons = true;
    this.shopService.getCustomerChallenges(this.data.customerId!, this.data.shopCode!).subscribe({
      next: (res: any) => {
        if (res.data && res.data.content) {
          // Only show coupons where customerRewardDto is present (completed challenges)
          this.availableCoupons = res.data.content
            .filter((item: any) => item.customerRewardDto)
            .map((item: any) => ({
              code: item.customerRewardDto.couponCode,
              description: item.challengeName,
              rewardType: item.customerRewardDto.type,
              scope: item.customerRewardDto.scope,
              discountPercentage: item.customerRewardDto.discountPercentage,
              productId: item.customerRewardDto.productId || item.productId,
              productDto: item.productDto,
              rewardId: item.customerRewardDto.id,
              expiry: item.customerRewardDto.claimByDate,
              status: item.customerRewardDto.status,
              customerRewardDto: item.customerRewardDto,
              challengeStatus: item.status,
              claimable: item.claimable,
              image: item.productDto?.documentDto?.attachments?.[0]?.url || 'https://seanl80.sg-host.com/wp-content/uploads/woocommerce-placeholder-600x600.png'
            }));

          // Fetch product details in bulk to get images
          const productIds = this.availableCoupons
            .filter(c => c.rewardType === 'PHYSICAL_PRODUCT' && c.productId)
            .map(c => c.productId);

          if (productIds.length > 0) {
            this.shopService.getProductsByIds(productIds).subscribe({
              next: (prodRes: any) => {
                const products: any[] = prodRes.data || [];
                this.availableCoupons.forEach(coupon => {
                  if (coupon.rewardType === 'PHYSICAL_PRODUCT') {
                    const product = products.find(p => p.productId === coupon.productId);
                    if (product?.documentDto?.attachments?.length > 0) {
                      coupon.image = product.documentDto.attachments[0].url;
                    }
                  }
                });

                // Sort USED coupons to the back
                this.availableCoupons.sort((a, b) => {
                  if (a.status === 'USED' && b.status !== 'USED') return 1;
                  if (a.status !== 'USED' && b.status === 'USED') return -1;
                  return 0;
                });
              }
            });
          } else {
            // Sort even if no products were fetched
            this.availableCoupons.sort((a, b) => {
              if (a.status === 'USED' && b.status !== 'USED') return 1;
              if (a.status !== 'USED' && b.status === 'USED') return -1;
              return 0;
            });
          }
        }
        this.loadingCoupons = false;
      },
      error: (err: any) => {
        console.error('Error fetching coupons:', err);
        this.loadingCoupons = false;
      }
    });
  }

  applyCoupon(coupon: any) {
    this.dialogRef.close({
      type: 'coupon',
      reward: coupon.customerRewardDto,
      coupon: coupon
    });
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

  cancel() {
    this.dialogRef.close(null);
  }
}
