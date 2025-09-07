import { Component, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { A11yModule } from "@angular/cdk/a11y";
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { ResponseDate } from 'src/app/app.component';
import { ShopModel } from 'src/app/models/shop.model';
import { OrganizationServiceModel } from 'src/app/models/organization';

@Component({
  selector: 'app-service-actions',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, A11yModule, CommonModule, FormsModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './service-actions.component.html',
  styleUrl: './service-actions.component.scss'
})
export class ServiceActionsComponent {
  
  serviceForm!: FormGroup;

  readonly dialogRef = inject(MatDialogRef<ServiceActionsComponent>);

  readonly data = inject<any>(MAT_DIALOG_DATA);
  industries: any[] = [];
  shops: ShopModel[] = [];

  constructor(private dialog: MatDialog, private orgService: OrganizationServiceService, private fb: FormBuilder) {
    if (this.data?.industries) {
      this.industries = this.data.industries; // set industries from parent
    }
  }

  selectedIndustryId: any = '';
  selectedSegmentId: any = '';
  selectedCategoryId: number | "" = '';

  selectedSegment: any[] = [];

  ngOnInit(): void {
    this.serviceForm = this.fb.group({
      serviceName: ['', Validators.required],
      industryId: ['', Validators.required],
      segmentId: ['', Validators.required],
      priceType: ['', Validators.required],
      serviceType: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      duration: [null, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      shops: this.fb.array([])
    });
  }

  get shopFormArray(): FormArray {
    return this.serviceForm.get('shops') as FormArray;
  }

  createService() {
    if (this.serviceForm.valid) {
      const formValue = this.serviceForm.value;

      // Get checked shopIds
      const shopIds = this.shops
        .map((shop, i) => formValue.shops[i] ? shop.id : undefined)
        .filter((id): id is number => id !== undefined);

      const payload: OrganizationServiceModel = {
        name: formValue.serviceName,
        description: formValue.description,
        isAddon: formValue.isAddon,
        deleted: formValue.deleted,
        defaultPrice: formValue.price,
        defaultDuration: formValue.duration,
        priceType: formValue.priceType,
        serviceType: formValue.serviceType,
        industrySegment: { id: formValue.segmentId },
        shopIds: shopIds ?? []
      };

      console.log('Payload:', payload);


      this.orgService.createOrgService(payload).subscribe({
        next: (res: ResponseDate) => {
          this.dialogRef.close(res.data);
        },
        error: (err: any) => {

        }
      })
    } else {
      // 👇 Mark all controls as touched so validation messages show
      this.serviceForm.markAllAsTouched();

      // 👇 Optional: log invalid controls
      Object.keys(this.serviceForm.controls).forEach(key => {
        const control = this.serviceForm.get(key);
        if (control?.invalid) {
          console.warn(`${key} is invalid:`, control.errors);
        }
      });
    }

  }

  closeDialog() {
    this.dialogRef.close();
  }

  onIndustryChange($event: any) {
    if ($event > 0) {
      let industry = this.industries.find((ind: any) => ind.id == $event);
      this.selectedSegment = industry.industrySegments;
      this.loadShopsByIndustry(industry.id);
    }
  }

  loadShopsByIndustry(industryId: number) {
    this.orgService.getOrgShopsByIndustry(industryId).subscribe({
      next: (res: ResponseDate) => {
        this.shops = res.data.map((shop: ShopModel) => ({
          ...shop,
          checked: true
        }));
        // clear existing formArray
        this.shopFormArray.clear();
        // re-create form controls for each shop
        this.shops.forEach(shop =>
          this.shopFormArray.push(this.fb.control(shop.checked))
        );
        console.log(this.shops);

      },
      error: (err: any) => {

      }
    })
  }



}
