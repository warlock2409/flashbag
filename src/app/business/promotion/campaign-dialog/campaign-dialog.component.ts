import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { GiftCampaign } from 'src/app/models/gift-campaign.model';

export interface CampaignDialogData {
  mode: 'create' | 'edit';
  campaign?: GiftCampaign;
}

@Component({
  selector: 'app-campaign-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './campaign-dialog.component.html',
  styleUrls: ['./campaign-dialog.component.scss']
})
export class CampaignDialogComponent implements OnInit {
  campaignForm!: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CampaignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CampaignDialogData
  ) { }

  ngOnInit(): void {
    this.isEditMode = this.data?.mode === 'edit';
    const c = this.data?.campaign;

    const minPurchaseRs = c?.minimumPurchase ? c.minimumPurchase / 100 : 500;
    const maxGiftRs = c?.maximumGift ? c.maximumGift / 100 : 100;
    const percentage = c?.rewardPercentage ?? 10;

    const todayStr = new Date().toISOString().substring(0, 10);
    const thirtyDaysLaterStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    const startStr = c?.startDate ? new Date(c.startDate).toISOString().substring(0, 10) : todayStr;
    const endStr = c?.endDate ? new Date(c.endDate).toISOString().substring(0, 10) : thirtyDaysLaterStr;

    this.campaignForm = this.fb.group({
      name: [c?.name || '', [Validators.required, Validators.maxLength(100)]],
      description: [c?.description || '', [Validators.required, Validators.maxLength(250)]],
      rewardPercentage: [percentage, [Validators.required, Validators.min(1), Validators.max(100)]],
      minimumPurchaseRupees: [minPurchaseRs, [Validators.required, Validators.min(0)]],
      maximumGiftRupees: [maxGiftRs, [Validators.required, Validators.min(1)]],
      startDateStr: [startStr, [Validators.required]],
      endDateStr: [endStr, [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.campaignForm.invalid) {
      this.campaignForm.markAllAsTouched();
      return;
    }

    const raw = this.campaignForm.value;

    const startDate = new Date(raw.startDateStr + 'T00:00:00.000Z').toISOString();
    const endDate = new Date(raw.endDateStr + 'T23:59:59.000Z').toISOString();

    const payload: Partial<GiftCampaign> = {
      name: raw.name.trim(),
      description: raw.description.trim(),
      rewardPercentage: Number(raw.rewardPercentage),
      minimumPurchase: Math.round(Number(raw.minimumPurchaseRupees) * 100),
      maximumGift: Math.round(Number(raw.maximumGiftRupees) * 100),
      startDate: startDate,
      endDate: endDate
    };

    this.dialogRef.close(payload);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
