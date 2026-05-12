import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductActionDialogComponent } from './product-action-dialog/product-action-dialog.component';
import { DocumentDto } from 'src/app/components/upload-media/upload-media.component';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { SweatAlertService } from 'src/app/services/sweat-alert.service';
import { inject } from '@angular/core';
import Swal from 'sweetalert2';

interface Batch {
  batchId: number;
  batchNumber: string;
  remainingQuantity: number;
  reservedQuantity: number;
  totalQuantity: number;
  costPrice: number;
  sellingPrice: number;
  expiryDate?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CLEARANCE';
  shopName?: string;
}

interface Product {
  orgProductId: string;
  id: string;
  name: string;
  subName?: string;
  category: string;
  documentId?: number;
  documentDto?: DocumentDto;
  price: number;
  stock: number;
  maxStock: number; // For progress bar
  status: 'ACTIVE' | 'INACTIVE';
  lowStockThreshold: number;
  type: 'PHYSICAL' | 'DIGITAL';
  description?: string;
  taxable: boolean;
  isAddon: boolean;
  voucherDetails?: {
    type: 'SESSION' | 'CREDIT';
    amount: number;
    validityDays: number;
  };
  batches: Batch[];
  reservedStock: number;
  soldCount: number;
  revenue: number;
  profit: number;
}

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  viewMode: 'list' | 'details' = 'list';
  isLoading = false;
  totalElements = 0;
  pageNumber = 0;
  pageSize = 10;
  private sweatAlert = inject(SweatAlertService);

  // Dashboard Stats
  stats = {
    totalValue: 12480,
    valueChange: 4.2,
    activeSkus: 142,
    lowStockItems: 8,
    topPerformer: 'Whey Isolate'
  };

  products: Product[] = [];

  selectedProduct: Product | null = null;
  stockForm!: FormGroup;
  categories: string[] = ['Supplements', 'Equipment', 'Services', 'Beverages', 'Merchandise'];
  shops: string[] = ['Main Sub-Center', 'Downtown Gym', 'Westside Studio'];

  constructor(private fb: FormBuilder, private dialog: MatDialog, private orgService: OrganizationServiceService) {
    this.initStockForm();
  }

  ngOnInit(): void {
    this.getOrgIndustry();
    this.getShopProducts();
  }

  getShopProducts(page: number = 0, size: number = 10) {
    this.isLoading = true;
    this.orgService.getShopProducts(page, size).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.data) {
          this.totalElements = res.data.totalElements;
          this.pageNumber = res.data.pageable.pageNumber;
          this.pageSize = res.data.pageable.pageSize;

          this.products = res.data.content.map((p: any) => ({
            orgProductId: p.orgProductId.toString(),
            id: p.productId.toString(),
            name: p.productName,
            subName: p.productBrand,
            category: p.categoryName,
            price: p.price,
            stock: p.availableStock,
            maxStock: 100, // Default for progress bar
            status: p.active ? 'ACTIVE' : 'INACTIVE',
            lowStockThreshold: 10,
            type: 'PHYSICAL', // Default
            description: p.productDescription,
            taxable: true,
            isAddon: false,
            reservedStock: p.reservedStock,
            soldCount: 0,
            revenue: 0,
            profit: 0,
            batches: [],
            documentDto: p.documentDto
          }));

          // Update stats based on fetched products
          this.stats.activeSkus = this.totalElements;
          this.stats.lowStockItems = res.data.content.filter((p: any) => p.lowStock).length;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching products', err);
      }
    });
  }

  getOrgIndustry() {
    this.orgService.getOrgIndustryByShop().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          const productSegments: string[] = [];
          res.data.forEach((industry: any) => {
            if (industry.industrySegments) {
              industry.industrySegments.forEach((segment: any) => {
                if (segment.type === 'PRODUCT') {
                  productSegments.push(segment.name);
                }
              });
            }
          });
          this.categories = productSegments;
        }
      },
      error: (err: any) => {
        console.error('Error fetching industries', err);
      }
    });
  }


  initStockForm() {
    this.stockForm = this.fb.group({
      shop: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      costPrice: [0, [Validators.required, Validators.min(0)]],
      sellingPrice: [0, [Validators.required, Validators.min(0)]],
      expiryDate: [''],
      supplierRef: [''],
      notes: ['']
    });
  }

  switchView(mode: 'list' | 'details', product: Product | null = null) {
    this.viewMode = mode;
    this.selectedProduct = product;
    if (mode === 'details' && product) {
      console.log('product', product);
      this.fetchProductDetails(product.id);
    }
  }

  fetchProductDetails(productId: string) {
    this.isLoading = true;
    this.orgService.getProductDetails(productId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.data && this.selectedProduct) {
          this.selectedProduct.batches = res.data.batches.map((b: any) => ({
            batchId: b.batchId,
            batchNumber: b.batchNumber,
            remainingQuantity: b.remainingQuantity,
            reservedQuantity: b.reservedQuantity,
            totalQuantity: b.totalQuantity || b.remainingQuantity,
            costPrice: b.costPrice,
            sellingPrice: b.sellingPrice,
            expiryDate: b.expiryDate,
            status: b.status,
            shopName: b.shopName
          }));

          // Recalculate total available stock from batches if needed, 
          // or if the API returns totalStock use that.
          this.selectedProduct.stock = this.selectedProduct.batches.reduce((acc, curr) => acc + curr.remainingQuantity, 0);
          this.selectedProduct.reservedStock = this.selectedProduct.batches.reduce((acc, curr) => acc + (curr.reservedQuantity || 0), 0);
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching product details', err);
      }
    });
  }

  openProductDialog(mode: 'add' | 'edit', product: Product | null = null) {
    const dialogRef = this.dialog.open(ProductActionDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: { viewMode: mode, product: product },
      panelClass: 'custom-dialog-container',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleProductSave(mode, result, product?.id);
      }
    });
  }

  handleProductSave(mode: 'add' | 'edit', formData: any, productId?: string) {
    if (mode === 'add') {
      this.getShopProducts(this.pageNumber, this.pageSize);
      return;
    } else if (mode === 'edit' && productId) {
      const index = this.products.findIndex(p => p.id === productId);
      if (index !== -1) {
        this.products[index] = {
          ...this.products[index],
          ...formData,
          voucherDetails: formData.type === 'DIGITAL' ? {
            type: formData.voucherType,
            amount: formData.voucherAmount,
            validityDays: formData.validityDays
          } : undefined
        };
      }
    }
  }

  deleteProduct(id: string) {
    this.sweatAlert.confirm('This action cannot be undone', 'Delete Product?').then(result => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.orgService.deleteProduct(id).subscribe({
          next: () => {
            this.isLoading = false;
            this.sweatAlert.success('Product deleted successfully');
            this.getShopProducts(this.pageNumber, this.pageSize);
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Error deleting product', err);
            this.sweatAlert.error('Failed to delete product');
          }
        });
      }
    });
  }

  openAddStockModal(tpl: any) {
    if (!this.selectedProduct) return;

    // Set default values from localStorage and product
    const shopName = localStorage.getItem("shopName") || 'Main Sub-Center';
    this.stockForm.patchValue({
      sellingPrice: this.selectedProduct.price,
      shop: shopName
    });

    this.dialog.open(tpl, {
      width: '900px',
      autoFocus: false,
      panelClass: 'custom-dialog-container'
    });
  }

  confirmAddStock() {
    if (this.stockForm.invalid || !this.selectedProduct) return;

    const stockData = this.stockForm.value;
    const shopCode = localStorage.getItem("shopCode");

    const batchRequest = {
      shopCode: shopCode,
      quantity: stockData.quantity,
      costPricePerUnit: stockData.costPrice,
      sellingPricePerUnit: stockData.sellingPrice,
      expiryDate: stockData.expiryDate ? new Date(stockData.expiryDate).toISOString() : null,
      expiryWarningDays: 10,
      supplierReference: stockData.supplierRef || '',
      notes: stockData.notes || ''
    };

    this.isLoading = true;
    this.orgService.addProductBatch(this.selectedProduct.id, batchRequest).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.sweatAlert.success('Stock added successfully');
        if (this.selectedProduct) {
          this.fetchProductDetails(this.selectedProduct.id);
        }
        this.dialog.closeAll();
        this.stockForm.reset();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error adding stock', err);
        this.sweatAlert.error('Failed to add stock');
      }
    });
  }

  getProfitMargin(): number {
    const cost = this.stockForm.get('costPrice')?.value || 0;
    const selling = this.stockForm.get('sellingPrice')?.value || 0;
    if (selling === 0) return 0;
    return ((selling - cost) / selling) * 100;
  }

  getTotalCost(): number {
    const cost = this.stockForm.get('costPrice')?.value || 0;
    const qty = this.stockForm.get('quantity')?.value || 0;
    return cost * qty;
  }

  getExpectedRevenue(): number {
    const selling = this.stockForm.get('sellingPrice')?.value || 0;
    const qty = this.stockForm.get('quantity')?.value || 0;
    return selling * qty;
  }

  getNetProfit(): number {
    return this.getExpectedRevenue() - this.getTotalCost();
  }

  writeOffBatch(batch: Batch) {
    Swal.fire({
      title: 'Write-off Batch',
      text: `Are you sure you want to write-off batch ${batch.batchNumber}? This will mark it as a loss. You can optionally provide a reason below.`,
      icon: 'warning',
      input: 'textarea',
      inputPlaceholder: 'Reason for write-off (Optional)...',
      showCancelButton: true,
      confirmButtonText: 'Yes, Write-off',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b'
    }).then((result) => {
      if (result.isConfirmed) {
        const notes = result.value || null;
        this.isLoading = true;
        this.orgService.writeOffBatch(batch.batchId, notes).subscribe({
          next: () => {
            this.isLoading = false;
            this.sweatAlert.success('Batch written off successfully');
            if (this.selectedProduct) {
              this.fetchProductDetails(this.selectedProduct.id);
            }
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Error writing off batch', err);
            this.sweatAlert.error('Failed to write off batch');
          }
        });
      }
    });
  }
}
