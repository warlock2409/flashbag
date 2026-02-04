import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NzMessageService, NzMessageModule } from 'ng-zorro-antd/message';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { CommonModule, DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AdvertisementDialogComponent } from './advertisement-dialog/advertisement-dialog.component';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-advertisement',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule, DecimalPipe, TitleCasePipe, MatButtonModule, NzMessageModule],
  templateUrl: './advertisement.component.html',
  styleUrl: './advertisement.component.scss'
})
export class AdvertisementComponent {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _snackBar = inject(NzMessageService);
  orgService = inject(OrganizationServiceService);

  advertisements: any[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  shopCode: string | null = null;
  searchQuery = '';
  activeFilter = 'all'; // 'all', 'active', or 'inactive'

  constructor(public dialog: MatDialog) {
    this.shopCode = localStorage.getItem("shopCode");
    if (this.shopCode)
      this.getAdvertisements();
  }

  getAdvertisements() {
    let isExpired: boolean | undefined;
    if (this.activeFilter === 'active') {
      isExpired = false;
    } else if (this.activeFilter === 'inactive') {
      isExpired = true;
    }

    this.orgService.getAdvertisementsByShop(this.pageIndex, this.pageSize, isExpired).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.advertisements = res.data.content;
          this.totalElements = res.data.totalElements;
        }
      },
      error: (err) => {
        console.error('Error fetching advertisements', err);
        // this._snackBar.error('Failed to load advertisements');
      }
    });
  }

  onSearchChange(event: any) {
    this.searchQuery = event.target.value;
    // Reset to first page when searching
    this.pageIndex = 0;
    this.getAdvertisements();
  }

  onFilterChange(filter: string) {
    this.activeFilter = filter;
    // Reset to first page when changing filter
    this.pageIndex = 0;
    // Also reset the paginator to first page
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.getAdvertisements();
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getAdvertisements();
  }

  isExpired(endDate: string | Date): boolean {
    if (!endDate) return false;

    const expiry = new Date(endDate);
    const now = new Date();

    // Compare only date (not time)
    return expiry.getTime() < now.getTime();
  }

  addAdvertisementManually(): void {
    const dialogRef = this.dialog.open(AdvertisementDialogComponent, {
      data: {},
      width: '800px',
      maxWidth: '95vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh advertisements list if needed
        this.getAdvertisements();
      }
    });
  }

  openEditAdvertisement(ad: any): void {
    const dialogRef = this.dialog.open(AdvertisementDialogComponent, {
      data: ad,
      width: '800px',
      maxWidth: '95vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh advertisements list if needed
        this.getAdvertisements();
      }
    });
  }

  importAdvertisements(): void {
    // In a real implementation, this would open an import dialog
    this._snackBar.info('Import advertisements functionality would open here');
  }
}
