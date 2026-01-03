import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ResponseDate } from 'src/app/app.component';
import { ShopService } from 'src/app/services/shop.service';
import { InvoiceItem } from '../components/point-of-sale/InvoiceItem';
import { InvoiceModel } from 'src/app/models/payment.model';
import { MatDialog } from '@angular/material/dialog';
import { PosComponent } from '../components/pos/pos.component';
import { PageEvent, MatPaginator } from '@angular/material/paginator';

export interface Booking {
  vehicleId: number;
  bookingId: number;
  vehicleName: string;
  startDate: string;
  endDate: string;
  totalAmount: number | null;
  status: string;
}
@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  standalone: false
})
export class OrdersComponent implements OnInit {



  // 🟢 Dependency Injection → All services, router, store, etc. injected in constructor

  shopService = inject(ShopService)
  dialog = inject(MatDialog);
  @ViewChild(MatPaginator) paginator!: MatPaginator;


  // 🔹 Properties & State → All class-level variables

  selectedTab: string = 'ISSUED';
  invoiceList: InvoiceModel[] = []
  private searchTimeout: any;
  searchQuery = '';
  shopCode!: any;
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;
  // filters DRAFT, ISSUED, PARTIALLY_PAID, PAID, CANCELLED
  // ============================================================
  // 🔹 FILTER TABS CONFIGURATION
  // ============================================================
  tabs = [
    {
      value: 'DRAFT',
      label: 'Draft',
      description: 'Invoice is created but not yet finalized.',
      count: 0,
      badgeClass: 'bg-gray-200 text-gray-700 ring-gray-300'
    },
    {
      value: 'ISSUED',
      label: 'Issued',
      description: 'Invoice has been issued to the customer.',
      count: 0,
      badgeClass: 'bg-blue-200 text-blue-700 ring-blue-300'
    },
    {
      value: 'PARTIALLY_PAID',
      label: 'Partially Paid',
      description: 'Customer has paid part of the invoice amount.',
      count: 0,
      badgeClass: 'bg-amber-200 text-amber-700 ring-amber-300'
    },
    {
      value: 'PAID',
      label: 'Paid',
      description: 'Invoice has been fully paid by the customer.',
      count: 0,
      badgeClass: 'bg-green-200 text-green-700 ring-green-300'
    },
    {
      value: 'CANCELLED',
      label: 'Cancelled',
      description: 'Invoice was cancelled and is no longer valid.',
      count: 0,
      badgeClass: 'bg-red-200 text-red-700 ring-red-300'
    }
  ];


  selectTab(tab: string) {
    this.selectedTab = tab;
    // Reset to first page when changing tabs
    this.pageIndex = 0;
    // Also reset the paginator component to first page
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.getAllInvoicesByShop();
  }  // ⚡️ Lifecycle Hooks → ngOnInit, ngOnDestroy, etc.

  constructor() {

  }

  ngOnInit() {
    this.shopCode = localStorage.getItem("shopCode");
    // Get all Invoices by default Type open
    console.log("order", this.shopCode);

    if (this.shopCode) {
      this.getAllInvoicesByShop();
      this.getInvoiceStatusCount();
    } else {
      // If there's no shop code, we don't need to show loading
      this.loading = false;
    }
  }

  ngOnDestroy() {

  }


  // 🌐 API Calls → All service calls / backend integrations

  getAllInvoicesByShop() {
    // Show loading spinner
    this.loading = true;
    
    // Update the service call to pass pagination parameters
    this.shopService.getAllInvoicesByShop(this.selectedTab, this.searchQuery, this.pageIndex, this.pageSize).subscribe({
      next: (res: ResponseDate) => {
        // Handle paginated response
        this.invoiceList = res.data.content || res.data;

        // Set pagination properties if they exist in the response
        if (res.data.totalElements !== undefined) {
          this.totalElements = res.data.totalElements;
        }
        if (res.data.size !== undefined) {
          this.pageSize = res.data.size;
        }
        
        // Hide loading spinner
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching invoices:', err);
        // Hide loading spinner even on error
        this.loading = false;
      }
    })
  }
  getInvoiceStatusCount() {
    this.shopService.getInvoiceStatusCount().subscribe({
      next: (res: ResponseDate) => {
        console.log(res);
        this.updateTabCounts(res.data)
      },
      error: (err: any) => {
        console.error('Error fetching invoice status count:', err);
      }
    })
  }

  // 🛠️ Helper Methods → Utility functions, formatters, mappers


  statusClasses: Record<string, string> = {
    DRAFT: 'bg-gray-200 text-gray-700 ring-gray-300',
    ISSUED: 'bg-blue-200 text-blue-700 ring-blue-300',
    PARTIALLY_PAID: 'bg-amber-500/15 text-amber-700 ring-amber-500/20',
    PAID: 'bg-green-200 text-green-700 ring-green-300',
    CANCELLED: 'bg-red-200 text-red-700 ring-red-300'
  };

  openNewInvoice() {
    const dialogRef = this.dialog.open(PosComponent, {
      width: '100%',
      maxWidth: '100vw', // override default 80vw
      height: '100%',
      panelClass: 'full-screen-dialog',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getAllInvoicesByShop();
      this.getInvoiceStatusCount();
    });
  }

  openExisitingInvoice(invoice: InvoiceModel) {
    const dialogRef = this.dialog.open(PosComponent, {
      width: '100%',
      maxWidth: '100vw', // override default 80vw
      height: '100%',
      panelClass: 'full-screen-dialog',
      disableClose: true,
      data: { existingInvoice: invoice }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getAllInvoicesByShop();
      this.getInvoiceStatusCount();
    });
  }

  updateTabCounts(apiData: [string, number][]): void {
    // First, reset all tab counts to zero
    this.tabs.forEach(tab => {
      tab.count = 0;
    });

    // Then, update with the API data
    apiData.forEach(([status, count]) => {
      const tab = this.tabs.find(t => t.value === status);
      if (tab) {
        tab.count = count;
      }
    });
  }

  onSearchChange() {
    // Clear old timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    // Set new timeout (debounce 400ms)
    this.searchTimeout = setTimeout(() => {
      // Reset to first page when searching
      this.pageIndex = 0;
      if (this.searchQuery.trim()) {
        this.getAllInvoicesByShop();
      } else {
        this.getAllInvoicesByShop();
      }
    }, 400);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getAllInvoicesByShop();
  }
} 