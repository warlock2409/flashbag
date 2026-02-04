import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NzMessageService } from 'ng-zorro-antd/message';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { ResponseDate } from 'src/app/app.component';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { CommonModule, DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AdvertisementDialogComponent } from './advertisement-dialog/advertisement-dialog.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-advertisement',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule, DecimalPipe, TitleCasePipe,MatButtonModule],
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
    // Mock data for now - in real implementation, this would call an API
    this.advertisements = [
      {
        id: 1,
        title: 'Summer Sale Campaign',
        description: 'Special discounts for summer products',
        mediaType: 'image',
        mediaUrl: 'https://via.placeholder.com/300x200',
        startDate: '2023-06-15',
        endDate: '2023-08-30',
        status: 'active',
        targetArea: 'Homepage Banner',
        clickThroughRate: '2.5%',
        impressions: 12500
      },
      {
        id: 2,
        title: 'New Product Launch',
        description: 'Introducing our latest product line',
        mediaType: 'video',
        mediaUrl: 'https://via.placeholder.com/300x200/4a90e2/FFFFFF?text=Video',
        startDate: '2023-07-01',
        endDate: '2023-09-15',
        status: 'active',
        targetArea: 'Sidebar Promotion',
        clickThroughRate: '1.8%',
        impressions: 8700
      },
      {
        id: 3,
        title: 'End of Season Clearance',
        description: 'Up to 70% off on winter collection',
        mediaType: 'image',
        mediaUrl: 'https://via.placeholder.com/300x200/d0021b/FFFFFF?text=Sale',
        startDate: '2023-08-20',
        endDate: '2023-09-30',
        status: 'inactive',
        targetArea: 'Homepage Banner',
        clickThroughRate: '3.2%',
        impressions: 15600
      }
    ];
    this.totalElements = this.advertisements.length;
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
      minWidth: "500px",
      maxWidth: "800px"
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
