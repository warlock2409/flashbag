import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { A11yModule } from '@angular/cdk/a11y';
import { DocumentDto, UploadMediaComponent } from "src/app/components/upload-media/upload-media.component";
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { ShopSelectionDialogComponent } from '../shop-selection-dialog/shop-selection-dialog.component';

@Component({
  selector: 'app-product-action-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSlideToggleModule,
    A11yModule,
    UploadMediaComponent
  ],
  templateUrl: './product-action-dialog.component.html',
  styleUrl: './product-action-dialog.component.scss'
})
export class ProductActionDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ProductActionDialogComponent>);
  public data = inject<any>(MAT_DIALOG_DATA);
  private orgService = inject(OrganizationServiceService);
  private dialog = inject(MatDialog);

  productForm!: FormGroup;
  viewMode: 'add' | 'edit' = 'add';
  categories: string[] = ['Supplements', 'Equipment', 'Services', 'Beverages', 'Merchandise'];
  industrySegments: any[] = [];
  existingUploads: DocumentDto | null = null;

  ngOnInit(): void {
    this.getOrgIndustry();
    this.viewMode = this.data.viewMode || 'add';
    this.initProductForm();

    if (this.viewMode === 'edit' && this.data.product) {
      console.log(this.data.product);

      this.productForm.patchValue({
        name: this.data.product.name,
        subName: this.data.product.subName,
        description: this.data.product.description,
        type: this.data.product.type,
        price: this.data.product.price,
        taxable: this.data.product.taxable,
        isAddon: this.data.product.isAddon,
        documentId: this.data.product.documentId,
        category: this.data.product.category,
        lowStockThreshold: this.data.product.lowStockThreshold,
        maxStock: this.data.product.maxStock,
        voucherType: this.data.product.voucherDetails?.type || 'SESSION',
        voucherAmount: this.data.product.voucherDetails?.amount || 0,
        validityDays: this.data.product.voucherDetails?.validityDays || 30
      });
      this.existingUploads = this.data.product.documentDto;
    }
  }

  getOrgIndustry() {
    this.orgService.getOrgIndustryByShop().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          const segments: any[] = [];
          res.data.forEach((industry: any) => {
            if (industry.industrySegments) {
              industry.industrySegments.forEach((segment: any) => {
                if (segment.type === 'PRODUCT') {
                  segments.push(segment);
                }
              });
            }
          });
          this.industrySegments = segments;
          this.categories = segments.map(s => s.name);
        }
      },
      error: (err: any) => {
        console.error('Error fetching industries', err);
      }
    });
  }

  initProductForm() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      subName: [''],
      description: [''],
      type: ['PHYSICAL', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      taxable: [true],
      isAddon: [false],
      documentId: [null],
      category: ['', Validators.required],
      lowStockThreshold: [5],
      maxStock: [100],
      voucherType: ['SESSION'],
      voucherAmount: [0],
      validityDays: [30]
    });

    // Listen for type changes to adjust validation
    this.productForm.get('type')?.valueChanges.subscribe(type => {
      if (type === 'DIGITAL') {
        this.productForm.get('voucherAmount')?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        this.productForm.get('voucherAmount')?.clearValidators();
      }
      this.productForm.get('voucherAmount')?.updateValueAndValidity();
    });
  }

  saveProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.value;

    if (this.viewMode === 'edit') {
      const updatePayload = {
        name: formValue.name,
        brand: formValue.subName,
        description: formValue.description,
        price: formValue.price,
        taxable: formValue.taxable,
        isAddon: formValue.isAddon,
        documentId: formValue.documentId
      };
      this.executeUpdateProduct(this.data.product.orgProductId, updatePayload);
    } else {
      const selectedSegment = this.industrySegments.find(s => s.name === formValue.category);
      const productPayload = {
        name: formValue.name,
        brand: formValue.subName,
        description: formValue.description,
        productType: formValue.type,
        price: formValue.price,
        taxable: formValue.taxable,
        isAddon: formValue.isAddon,
        industrySegmentId: selectedSegment?.id || null,
        documentId: formValue.documentId,
        shopIds: [] as number[]
      };

      this.orgService.getLocations().subscribe({
        next: (res: any) => {
          const shops = res.data;
          if (shops.length === 1) {
            productPayload.shopIds = [shops[0].id];
            this.executeCreateProduct(productPayload);
          } else if (shops.length > 1) {
            this.openShopSelectionDialog(shops, productPayload);
          } else {
            console.error('No shops found');
          }
        },
        error: (err: any) => {
          console.error('Error fetching locations', err);
        }
      });
    }
  }

  executeUpdateProduct(id: any, payload: any) {
    this.orgService.updateProduct(id, payload).subscribe({
      next: (res: any) => {
        console.log('Product updated successfully', res);
        this.dialogRef.close(res.data);
      },
      error: (err: any) => {
        console.error('Error updating product', err);
      }
    });
  }

  openShopSelectionDialog(shops: any[], productPayload: any) {
    // I'll implement this dialog component next
    // For now, let's keep the logic here
    const dialogRef = this.dialog.open(ShopSelectionDialogComponent, {
      data: { shops: shops },
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(selectedShopIds => {
      if (selectedShopIds && selectedShopIds.length > 0) {
        productPayload.shopIds = selectedShopIds;
        this.executeCreateProduct(productPayload);
      }
    });
  }

  executeCreateProduct(payload: any) {
    this.orgService.createProduct(payload).subscribe({
      next: (res: any) => {
        console.log('Product created successfully', res);
        this.dialogRef.close(res.data);
      },
      error: (err: any) => {
        console.error('Error creating product', err);
      }
    });
  }

  setDocument($event: DocumentDto) {
    this.productForm.patchValue({
      documentId: $event.id
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
