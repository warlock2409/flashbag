import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PromotionOffer } from 'src/app/models/promotion.model';

export interface OfferDialogData {
  mode: 'create' | 'edit';
  offer?: PromotionOffer;
}

@Component({
  selector: 'app-offer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  templateUrl: './offer-dialog.component.html',
  styleUrls: ['./offer-dialog.component.scss']
})
export class OfferDialogComponent implements OnInit {
  offerForm!: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<OfferDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OfferDialogData
  ) {}

  ngOnInit(): void {
    this.isEditMode = this.data?.mode === 'edit';
    const offer = this.data?.offer;

    const giftCostRs = offer?.giftCostPaise ? offer.giftCostPaise / 100 : 100;
    const discountAmountRs = offer?.discountAmountPaise ? offer.discountAmountPaise / 100 : 100;
    const minimumPurchaseRs = offer?.minimumPurchasePaise ? offer.minimumPurchasePaise / 100 : 500;

    const todayStr = new Date().toISOString().substring(0, 10);
    const thirtyDaysLaterStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    const startStr = offer?.startDate ? new Date(offer.startDate).toISOString().substring(0, 10) : todayStr;
    const endStr = offer?.endDate ? new Date(offer.endDate).toISOString().substring(0, 10) : thirtyDaysLaterStr;

    this.offerForm = this.fb.group({
      name: [offer?.name || '', [Validators.required, Validators.maxLength(100)]],
      description: [offer?.description || '', [Validators.required, Validators.maxLength(250)]],
      giftCostRupees: [giftCostRs, [Validators.required, Validators.min(0)]],
      discountAmountRupees: [discountAmountRs, [Validators.required, Validators.min(1)]],
      minimumPurchaseRupees: [minimumPurchaseRs, [Validators.required, Validators.min(0)]],
      maximumRedemptions: [offer?.maximumRedemptions ?? 100, [Validators.required, Validators.min(1)]],
      newCustomersOnly: [offer?.newCustomersOnly ?? false],
      startDateStr: [startStr, [Validators.required]],
      endDateStr: [endStr, [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.offerForm.invalid) {
      this.offerForm.markAllAsTouched();
      return;
    }

    const raw = this.offerForm.value;

    const startDate = new Date(raw.startDateStr + 'T00:00:00.000Z').toISOString();
    const endDate = new Date(raw.endDateStr + 'T23:59:59.000Z').toISOString();

    const payload: Partial<PromotionOffer> = {
      name: raw.name.trim(),
      description: raw.description.trim(),
      giftCostPaise: Math.round(Number(raw.giftCostRupees) * 100),
      discountAmountPaise: Math.round(Number(raw.discountAmountRupees) * 100),
      minimumPurchasePaise: Math.round(Number(raw.minimumPurchaseRupees) * 100),
      maximumRedemptions: Number(raw.maximumRedemptions),
      newCustomersOnly: Boolean(raw.newCustomersOnly),
      startDate: startDate,
      endDate: endDate
    };

    this.dialogRef.close(payload);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
