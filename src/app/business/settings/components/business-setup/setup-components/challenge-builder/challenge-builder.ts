import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { MembershipDialogComponent } from './membership-dialog/membership-dialog.component';

@Component({
  selector: 'app-challenge-builder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ],
  templateUrl: './challenge-builder.component.html',
  styleUrl: './challenge-builder.component.scss'
})
export class ChallengeBuilderComponent implements OnInit {
  challengeForm!: FormGroup;

  // Mock Data
  products: any[] = [];

  shops: any[] = [];

  membershipPlans: any[] = [];

  constructor(private fb: FormBuilder, private orgService: OrganizationServiceService, private dialog: MatDialog, private router: Router) {}

  ngOnInit(): void {
    this.initForm();
    this.loadShops();
  }

  loadShops(): void {
    this.orgService.getLocations().subscribe({
      next: (res: any) => {
        if (res.data) {
          this.shops = res.data;
        }
      },
      error: (err: any) => console.error('Error fetching shops', err)
    });
  }

  private initForm(): void {
    this.challengeForm = this.fb.group({
      // Step 1: Condition
      conditionType: ['ATTENDANCE', Validators.required],
      
      // Step 2: Goal
      targetValue: [10, [Validators.required, Validators.min(1)]],
      
      // Step 3: Reward
      rewardType: ['DISCOUNT', Validators.required],
      discountPercentage: [15],
      productId: [''],
      quantity: [1],
      
      // Step 4: Audience
      audienceType: ['ALL', Validators.required],
      membershipPlanId: [''],
      
      // Step 5: Shops
      shopIds: [[], Validators.required],
      
      // Step 6: Expiry
      expiryDays: [30, [Validators.required, Validators.min(1)]],
      
      // Step 7: Basic Info
      name: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      
      // Step 8: Limits
      limitRewards: [false],
      maxRedemptions: [100],

      // New settings
      autoEnroll: [true],
      forNewMembers: [false]
    });
  }

  // --- Helper Methods (Moved from sub-components) ---

  isConditionSelected(type: string): boolean {
    return this.challengeForm?.get('conditionType')?.value === type;
  }

  setConditionType(type: string): void {
    this.challengeForm?.get('conditionType')?.setValue(type);
    if (type === 'ATTENDANCE') {
      this.challengeForm?.get('audienceType')?.setValue('SPECIFIC');
    }
  }

  isRewardSelected(type: string): boolean {
    return this.challengeForm?.get('rewardType')?.value === type;
  }

  setRewardType(type: string): void {
    this.challengeForm?.get('rewardType')?.setValue(type);
    if (type === 'PRODUCT' && !this.challengeForm.get('productId')?.value) {
      this.openProductDialog();
    }
  }

  openProductDialog(): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      panelClass: 'product-dialog-container',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.products = [result];
        this.challengeForm.get('productId')?.setValue(result.id);
      }
    });
  }

  loadOrgProducts(): void {
    this.orgService.getOrgProducts().subscribe({
      next: (res: any) => {
        if (res.data?.content) {
          this.products = res.data.content;
        }
      },
      error: (err: any) => console.error('Error fetching org products', err)
    });
  }

  openMembershipDialog(): void {
    const dialogRef = this.dialog.open(MembershipDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      panelClass: 'membership-dialog-container',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.membershipPlans = [result];
        this.challengeForm.get('membershipPlanId')?.setValue(result.id);
      }
    });
  }

  isShopSelected(shopId: any): boolean {
    const selectedShops = this.challengeForm?.get('shopIds')?.value || [];
    return selectedShops.includes(shopId);
  }

  toggleShop(shopId: any): void {
    const currentShops = [...(this.challengeForm?.get('shopIds')?.value || [])];
    const index = currentShops.indexOf(shopId);
    if (index > -1) {
      currentShops.splice(index, 1);
    } else {
      currentShops.push(shopId);
    }
    this.challengeForm.get('shopIds')?.setValue(currentShops);
    this.challengeForm.get('shopIds')?.markAsTouched();
  }

  getGoalLabel(): string {
    const type = this.challengeForm?.get('conditionType')?.value;
    return type === 'ATTENDANCE' ? 'times' : '₹ amount';
  }

  getRulePreview(): string {
    const f = this.challengeForm?.value;
    const condition = f.conditionType === 'ATTENDANCE' 
      ? `Attend ${f.targetValue || 'X'} times`
      : `Spend ₹${f.targetValue || 'X'}`;
    
    const reward = f.rewardType === 'DISCOUNT'
      ? `get ${f.discountPercentage || 'X'}% OFF`
      : `get ${f.quantity || '1'}x ${this.products.find(p => p.id === f.productId)?.name || 'Product'}`;
    
    return `${condition} and ${reward}`;
  }

  onSubmit(): void {
    if (this.challengeForm.valid) {
      const f = this.challengeForm.value;
      
      const apiPayload = {
        name: f.name,
        membershipPlanId: f.audienceType === 'SPECIFIC' ? f.membershipPlanId : null,
        autoEnroll: f.autoEnroll,
        forNewMembers: f.forNewMembers,
        startDate: f.startDate,
        endDate: f.endDate,
        shopIds: f.shopIds,
        conditionType: f.conditionType,
        targetValue: f.targetValue,
        timeLimitDays: null,
        rewardType: f.rewardType === 'PRODUCT' ? 'PHYSICAL_PRODUCT' : f.rewardType,
        productId: f.rewardType === 'PRODUCT' ? f.productId : null,
        quantity: f.rewardType === 'PRODUCT' ? f.quantity : null,
        discountPercentage: f.rewardType === 'DISCOUNT' ? f.discountPercentage : null,
        maxRedemptions: f.limitRewards ? f.maxRedemptions : null,
        expiryDays: f.expiryDays
      };

      this.orgService.createChallenge(apiPayload).subscribe({
        next: (res: any) => {
          console.log('Challenge created successfully:', res);
          // Navigate back to the challenge list
          this.router.navigate(['/business/challenge']);
        },
        error: (err: any) => {
          console.error('Error creating challenge:', err);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/business/challenge']);
  }
}
