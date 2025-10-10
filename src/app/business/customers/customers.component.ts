import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NzMessageService } from 'ng-zorro-antd/message';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { AddCustomerComponent } from '../components/add-customer/add-customer.component';
import { ResponseDate } from 'src/app/app.component';
import { UserDto } from 'src/app/services/auth.service';
import { TimeZoneHelperService } from 'src/app/services/timeZoneHelper';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  standalone: false
})
export class CustomersComponent {


  private _snackBar = inject(NzMessageService);
  orgService = inject(OrganizationServiceService);
  customers: any[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(public dialog: MatDialog, private timeZoneHelper: TimeZoneHelperService) {
    this.getCustomerByOrg();
  }

  getCustomerByOrg() {
    this.orgService.getAllCustomerByOrg(this.pageIndex,this.pageSize).subscribe({
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
        this.totalElements = res.totalElements!
        this.pageSize = res.pageSize!
        console.log(this.customers);

      },
      error: (err: any) => {

      }
    })
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
      data: {}, minWidth: "360px"
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getCustomerByOrg();
    });
  }

} 