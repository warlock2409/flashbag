import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './product-dialog.component.html'
})
export class ProductDialogComponent implements OnInit, OnDestroy {
  filteredProducts: any[] = [];
  searchTerm: string = '';
  selectedProduct: any = null;

  page: number = 0;
  size: number = 10;
  isLastPage: boolean = false;
  isLoading: boolean = false;
  
  private searchSubject = new Subject<string>();

  constructor(
    private dialogRef: MatDialogRef<ProductDialogComponent>,
    private orgService: OrganizationServiceService
  ) {}

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(400)).subscribe(term => {
      this.searchTerm = term;
      this.page = 0;
      this.filteredProducts = [];
      this.getProducts();
    });
    this.getProducts();
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  onSearchChange(term: string) {
    this.searchSubject.next(term);
  }

  getProducts() {
    this.isLoading = true;
    this.orgService.getOrgProducts(this.page, this.size, this.searchTerm).subscribe({
      next: (res: any) => {
        if (res.data?.content) {
          if (this.page === 0) {
            this.filteredProducts = res.data.content;
          } else {
            this.filteredProducts = [...this.filteredProducts, ...res.data.content];
          }
          this.isLastPage = res.data.last;
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching org products', err);
        this.isLoading = false;
      }
    });
  }

  loadMore() {
    if (!this.isLastPage && !this.isLoading) {
      this.page++;
      this.getProducts();
    }
  }

  selectProduct(product: any) {
    this.selectedProduct = product;
  }

  close() {
    this.dialogRef.close();
  }

  confirm() {
    this.dialogRef.close(this.selectedProduct);
  }
}
