import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PromotionOffer } from 'src/app/models/promotion.model';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';

export interface OfferDialogData {
  mode: 'create' | 'edit';
  offer?: PromotionOffer;
}

export interface IndustrySegmentOption {
  id: number;
  name: string;
  industryName: string;
}

@Component({
  selector: 'app-offer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './offer-dialog.component.html',
  styleUrls: ['./offer-dialog.component.scss']
})
export class OfferDialogComponent implements OnInit {
  offerForm!: FormGroup;
  isEditMode: boolean = false;

  industrySegments: IndustrySegmentOption[] = [];
  industriesLoading: boolean = false;
  industriesError: boolean = false;

  constructor(
    private fb: FormBuilder,
    private orgService: OrganizationServiceService,
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
      industrySegmentIds: [offer?.industrySegmentIds ?? [], [Validators.required]],
      startDateStr: [startStr, [Validators.required]],
      endDateStr: [endStr, [Validators.required]]
    });

    this.loadIndustrySegments();
  }

  loadIndustrySegments(): void {
    this.industriesLoading = true;
    this.industriesError = false;

    this.orgService.getOrgIndustryByShop().subscribe({
      next: (res: any) => {
        const industries: any[] = Array.isArray(res) ? res : (res?.data ?? []);
        const options: IndustrySegmentOption[] = [];

        industries.forEach((industry: any) => {
          (industry?.industrySegments ?? []).forEach((segment: any) => {
            if (segment?.id != null) {
              options.push({
                id: Number(segment.id),
                name: segment.name,
                industryName: industry.name
              });
            }
          });
        });

        this.industrySegments = options;
        this.industriesLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching industries', err);
        this.industriesError = true;
        this.industriesLoading = false;
      }
    });
  }

  isSegmentSelected(id: number): boolean {
    const selected: number[] = this.offerForm.get('industrySegmentIds')?.value ?? [];
    return selected.includes(id);
  }

  toggleSegment(id: number, checked: boolean): void {
    const control = this.offerForm.get('industrySegmentIds');
    const selected: number[] = control?.value ?? [];
    const next = checked
      ? [...selected.filter(x => x !== id), id]
      : selected.filter(x => x !== id);
    control?.setValue(next);
    control?.markAsDirty();
    control?.markAsTouched();
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
      industrySegmentIds: (raw.industrySegmentIds ?? []).map((id: number) => Number(id)),
      startDate: startDate,
      endDate: endDate
    };

    this.dialogRef.close(payload);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
