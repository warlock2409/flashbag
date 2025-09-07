import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NzMessageService } from 'ng-zorro-antd/message';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { AddCustomerComponent } from '../components/add-customer/add-customer.component';
import { ResponseDate } from 'src/app/app.component';
import { UserDto } from 'src/app/services/auth.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  standalone: false
})
export class CustomersComponent {

  private _snackBar = inject(NzMessageService);
  orgService = inject(OrganizationServiceService);
  customers:any[]= [];

  constructor(public dialog: MatDialog) { 
    this.getCustomerByOrg();
  }

  getCustomerByOrg(){
    this.orgService.getAllCustomerByOrg().subscribe({
      next:(res:ResponseDate)=>{
        this.customers = res.data;
      },
      error:(err:any)=>{

      }
    })
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