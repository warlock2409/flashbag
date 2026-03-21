import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ResponseDate } from 'src/app/app.component';
import { Customer } from 'src/app/models/customer.model';
import { UserDto } from 'src/app/services/auth.service';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';

@Component({
  selector: 'app-god-box',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule],
  templateUrl: './god-box.component.html',
  styleUrl: './god-box.component.scss'
})
export class GodBoxComponent implements OnInit, AfterViewInit {

  orgService = inject(OrganizationServiceService);
  searchQuery = '';
  tabs = ['Customer'];
  selectedTab = 'Customer';
  private searchTimeout: any;
  customers: Customer[] = [];

  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(private dialogRef: MatDialogRef<GodBoxComponent>) {

  }

  ngOnInit(): void {
    // Initial fetch of customers when dialog opens
    this.performSearch(true);
  }

  ngAfterViewInit() {
    // Auto-focus the search input after the view initializes
    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.nativeElement.focus();
        // Fallback for some browsers/timing issues
        this.searchInput.nativeElement.select();
      }
    }, 200);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSearchChange() {
    this.performSearch();
  }

  private performSearch(immediate: boolean = false) {
    // Clear old timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    const fetch = () => {
      if (this.selectedTab == "Customer") {
        this.orgService.getCustomerByOrgShop(0, 50, this.searchQuery, undefined).subscribe({
          next: (res: ResponseDate) => {
            console.log(res);
            this.customers = res.data;
          },
          error: (err: any) => {
            console.error('Initial GodBox fetch failed', err);
          }
        });
      }
    };

    if (immediate) {
      fetch();
    } else {
      // Set new timeout (debounce 400ms)
      this.searchTimeout = setTimeout(() => {
        fetch();
      }, 400);
    }
  }



  returnCustomer(customer: Customer) {
    this.dialogRef.close(customer);
  }
}