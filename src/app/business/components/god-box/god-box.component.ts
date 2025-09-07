import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ResponseDate } from 'src/app/app.component';
import { Customer } from 'src/app/models/customer.model';
import { UserDto } from 'src/app/services/auth.service';
import { CustomerService } from 'src/app/services/customer.service';

@Component({
  selector: 'app-god-box',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule],
  templateUrl: './god-box.component.html',
  styleUrl: './god-box.component.scss'
})
export class GodBoxComponent {

  customerService = inject(CustomerService);
  searchQuery = '';
  tabs = ['Customer'];
  selectedTab = 'Customer';
  private searchTimeout: any;
  customers: UserDto[] = [];

  constructor(private dialogRef: MatDialogRef<GodBoxComponent>){

  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSearchChange() {
    // Clear old timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Set new timeout (debounce 400ms)
    this.searchTimeout = setTimeout(() => {
      if (this.searchQuery.trim()) {
        if (this.selectedTab == "Customer") {
          this.customerService.searchCustomer(this.searchQuery).subscribe({
            next: (res: ResponseDate) => {
              console.log(res);
              this.customers = res.data;
            },
            error: (err: any) => {

            }
          })
        }
      } else {
        this.customers = [];
      }
    }, 400);
  }

  returnCustomer(customer: UserDto) {
    this.dialogRef.close(customer);
  }
}
