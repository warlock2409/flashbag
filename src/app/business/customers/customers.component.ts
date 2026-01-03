import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NzMessageService } from 'ng-zorro-antd/message';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { AddCustomerComponent } from '../components/add-customer/add-customer.component';
import { ResponseDate } from 'src/app/app.component';
import { UserDto } from 'src/app/services/auth.service';
import { TimeZoneHelperService } from 'src/app/services/timeZoneHelper';
import { PageEvent, MatPaginator } from '@angular/material/paginator';

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

  constructor(public dialog: MatDialog, private timeZoneHelper: TimeZoneHelperService) {
    this.shopCode = localStorage.getItem("shopCode");
    if (this.shopCode)
      this.getCustomerByOrg();
  }

  getCustomerByOrg() {
    // Convert activeFilter to memStatus parameter
    let memStatus: boolean | undefined = undefined;
    if (this.activeFilter === 'active') {
      memStatus = true;
    } else if (this.activeFilter === 'inactive') {
      memStatus = false;
    }
    
    this.orgService.getAllCustomerByOrg(this.pageIndex, this.pageSize, this.searchQuery, memStatus).subscribe({
      next: (res: ResponseDate) => {
        this.customers = res.data.map((customer: any) => {
          if (customer.expiry) {
            customer.membershipExpiry = this.timeZoneHelper.toTimeZoneSpecific(undefined, customer.expiry)
          }
          if (customer.lastSpendDate) {
            customer.lastSpendDate = this.timeZoneHelper.toTimeZoneSpecific(undefined, customer.lastSpendDate)
          }
          return customer;
        });
        this.totalElements = res.totalElements || res.data.length;
        this.pageSize = res.pageSize || this.pageSize;
        console.log(this.customers);
      },
      error: (err: any) => {
        this._snackBar.error('Error fetching customers');
      }
    });
  }

  onSearchChange(event: any) {
    this.searchQuery = event.target.value;
    // Reset to first page when searching
    this.pageIndex = 0;
    this.getCustomerByOrg();
  }

  onFilterChange(filter: string) {
    this.activeFilter = filter;
    // Reset to first page when changing filter
    this.pageIndex = 0;
    // Also reset the paginator to first page
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.getCustomerByOrg();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getCustomerByOrg();
  }

  isExpired(expiryDate: string | Date): boolean {
    if (!expiryDate) return false;

    const expiry = new Date(expiryDate);
    const now = new Date();

    // Compare only date (not time)
    return expiry.getTime() < now.getTime();
  }

  addCustomerMannually(): void {
    const dialogRef = this.dialog.open(AddCustomerComponent, {
      data: {}, 
      minWidth: "400px",
      maxWidth: "500px"
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getCustomerByOrg();
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
        this.getCustomerByOrg();
      }
    });
  }
}