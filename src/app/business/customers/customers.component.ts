import { Component, HostListener, inject, ViewChild, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NzMessageService } from 'ng-zorro-antd/message';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { AddCustomerComponent } from '../components/add-customer/add-customer.component';
import { ResponseDate } from 'src/app/app.component';
import { TimeZoneHelperService } from 'src/app/services/timeZoneHelper';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  standalone: false
})
export class CustomersComponent {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _snackBar = inject(NzMessageService);
  orgService = inject(OrganizationServiceService);
  customers: any[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  shopCode;
  searchQuery = '';
  activeFilter = 'all'; // 'all', 'active', or 'inactive'
  configurePanelOpen: boolean = false;
  isMobileView: any = false;
  selectedCustomer: any;
  loading = false;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  selectedMonth: number | undefined = undefined;
  selectedYear: number | undefined = 2026;
  months = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 }
  ];
  years: number[] = [];


  constructor(public dialog: MatDialog, private timeZoneHelper: TimeZoneHelperService) {
    this.shopCode = localStorage.getItem("shopCode");

    // Initialize years (current year plus next 5 years)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i <= 5; i++) {
      this.years.push(currentYear + i);
    }

    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.pageIndex = 0;
      if (this.paginator) {
        this.paginator.pageIndex = 0;
      }
      this.getCustomerByOrgShop();
    });

    if (this.shopCode)
      this.getCustomerByOrgShop();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobileView = window.innerWidth <= 768;
  }

  getCustomerByOrgShop() {
    // Avoid redundant calls
    if (this.loading) return;

    this.loading = true;

    if (this.activeFilter === 'activity') {
      const month = this.selectedMonth || (new Date().getMonth() + 1);
      const year = this.selectedYear || new Date().getFullYear();

      this.orgService.getCustomerActivity(month, year, this.pageIndex, this.pageSize)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            // Activity response might be a plain array or a ServiceResponse
            const dataArr = Array.isArray(res) ? res : (res.data || []);
            this.customers = dataArr.map((customer: any) => {
              if (customer.fullName) {
                customer.firstName = customer.fullName.trim();
                customer.lastName = '';
              }
              if (customer.phone) {
                customer.contactNumber = customer.phone;
              }
              if (customer.membershipEndDate) {
                customer.membershipExpiry = this.timeZoneHelper.toTimeZoneSpecific(undefined, customer.membershipEndDate)
              }
              if (customer.lastCheckin) {
                customer.lastSpendDate = this.timeZoneHelper.toTimeZoneSpecific(undefined, customer.lastCheckin)
              }
              // Set DP from first attachment
              customer.profileImage = customer.documentDto?.attachments?.[0]?.url;
              return customer;
            });
            this.totalElements = res.totalElements || this.customers.length;
            this.pageSize = res.pageSize || this.pageSize;
            this.loading = false;
          },
          error: (err: any) => {
            this.loading = false;
            this._snackBar.error('Error fetching activities');
          }
        });
      return;
    }

    // Convert activeFilter to parameters
    let memStatus: boolean | undefined = undefined;
    let neverSpent: boolean | undefined = undefined;

    if (this.activeFilter === 'active') {
      memStatus = true;
    } else if (this.activeFilter === 'inactive') {
      memStatus = false;
    } else if (this.activeFilter === 'leads') {
      memStatus = false;
      neverSpent = true;
    } else if (this.activeFilter === 'expiry') {
      // For expiry, we don't fix memStatus, let it be undefined to show all
      // Or we can set it to true if only active memberships expire? 
      // User said "active and inactive status", so we leave it as undefined.
      memStatus = undefined;
    }

    this.orgService.getCustomerByOrgShop(this.pageIndex, this.pageSize, this.searchQuery, memStatus, neverSpent, this.selectedMonth, this.selectedYear)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ResponseDate) => {
          this.customers = res.data.map((customer: any) => {
            if (customer.expiry) {
              customer.membershipExpiry = this.timeZoneHelper.toTimeZoneSpecific(undefined, customer.expiry)
            }
            if (customer.lastSpendDate) {
              customer.lastSpendDate = this.timeZoneHelper.toTimeZoneSpecific(undefined, customer.lastSpendDate)
            }
            // Set DP from first attachment
            customer.profileImage = customer.documentDto?.attachments?.[0]?.url;
            return customer;
          });
          this.totalElements = res.totalElements || res.data.length;
          this.pageSize = res.pageSize || this.pageSize;
          this.loading = false;
        },
        error: (err: any) => {
          this.loading = false;
          this._snackBar.error('Error fetching customers');
        }
      });
  }

  onSearchChange(event: any) {
    this.searchQuery = event.target.value;
    this.searchSubject.next(this.searchQuery);
  }

  onFilterChange(filter: string) {
    this.activeFilter = filter;

    if (filter === 'expiry' || filter === 'activity') {
      const now = new Date();
      if (this.selectedMonth === undefined) this.selectedMonth = now.getMonth() + 1;
      if (this.selectedYear === undefined) this.selectedYear = now.getFullYear();
    } else {
      // Clear expiry/activity filters when switching to other tabs
      this.selectedMonth = undefined;
      this.selectedYear = undefined;
    }

    // Reset to first page when changing filter
    this.pageIndex = 0;
    // Also reset the paginator to first page
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.getCustomerByOrgShop();
  }

  onMonthChange(month: number | undefined) {
    this.selectedMonth = month;
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.getCustomerByOrgShop();
  }

  onYearChange(year: number | undefined) {
    this.selectedYear = year;
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.getCustomerByOrgShop();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getCustomerByOrgShop();
  }

  isExpired(expiryDate: string | Date): boolean {
    if (!expiryDate) return false;

    const expiry = new Date(expiryDate);
    const now = new Date();

    // Set both to start of day for accurate date-only comparison
    expiry.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    return expiry.getTime() < now.getTime();
  }

  addCustomerMannually(): void {
    const dialogRef = this.dialog.open(AddCustomerComponent, {
      data: {},
      minWidth: "400px",
      maxWidth: "500px"
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getCustomerByOrgShop();
    });
  }

  importCustomers(): void {
    // Open the add customer dialog with export mode
    const dialogRef = this.dialog.open(AddCustomerComponent, {
      data: { mode: 'export' },
      minWidth: "600px",  // Increased width for export mode
      maxWidth: "800px",  // Increased max width for export mode
      width: "70vw"       // Use viewport width for responsive sizing
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getCustomerByOrgShop();
      }
    });
  }

  openCustomerActions(customer: any): void {
    this.selectedCustomer = customer;
    this.configurePanelOpen = true;
  }

  closeConfigurePanel() {
    this.configurePanelOpen = false;
    this.getCustomerByOrgShop();
  }

  openImagePreview(url: string, event: MouseEvent): void {
    event.stopPropagation(); // Prevent opening customer actions sidebar
    this.dialog.open(ImagePreviewDialog, {
      data: { url },
      panelClass: 'image-preview-dialog',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
  }

  getInitials(firstName: string, lastName: string): string {
    return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();
  }
}

// Simple internal component for image preview
@Component({
  selector: 'image-preview-dialog',
  standalone: true,
  template: `
    <div style="position: relative; line-height: 0; background: transparent; padding: 0;">
      <img [src]="data.url" style="max-width: 100%; max-height: 90vh; display: block; border-radius: 4px; box-shadow: 0 4px 24px rgba(0,0,0,0.3);">
      <button (click)="dialogRef.close()" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); color: #fff; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); transition: background 0.2s;">
        <span style="font-size: 24px; line-height: 1;">&times;</span>
      </button>
    </div>
  `,
  styles: [`
    :host { display: block; padding: 0; background: transparent; }
  `],
  imports: []
})
export class ImagePreviewDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { url: string },
    public dialogRef: MatDialogRef<ImagePreviewDialog>
  ) { }
}