import { Component, inject } from '@angular/core';
import { ResponseDate } from 'src/app/app.component';
import { ShopService } from 'src/app/services/shop.service';
import { InvoiceItem } from '../components/point-of-sale/InvoiceItem';
import { InvoiceModel } from 'src/app/models/payment.model';
import { MatDialog } from '@angular/material/dialog';
import { PosComponent } from '../components/pos/pos.component';


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
export class OrdersComponent {



  // 🟢 Dependency Injection → All services, router, store, etc. injected in constructor

  shopService = inject(ShopService)
  dialog = inject(MatDialog);


  // 🔹 Properties & State → All class-level variables

  selectedTab: string = 'ISSUED';
  invoiceList: InvoiceModel[] = []
  private searchTimeout: any;
  searchQuery = '';

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
    this.getAllInvoicesByShop();
  }


  // ⚡️ Lifecycle Hooks → ngOnInit, ngOnDestroy, etc.

  constructor() {

  }

  ngOnInit() {
    // Get all Invoices by default Type open
    this.getAllInvoicesByShop();
    this.getInvoiceStatusCount();
  }

  ngOnDestroy() {

  }


  // 🌐 API Calls → All service calls / backend integrations

  getAllInvoicesByShop() {
    this.shopService.getAllInvoicesByShop(this.selectedTab, this.searchQuery).subscribe({
      next: (res: ResponseDate) => {
        this.invoiceList = res.data.content;
      },
      error: (err: any) => {

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
      data: { existingInvoice: invoice}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getAllInvoicesByShop();
      this.getInvoiceStatusCount();
    });
  }

  updateTabCounts(apiData: [string, number][]): void {
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
      if (this.searchQuery.trim()) {
        this.getAllInvoicesByShop();
      } else {
        this.getAllInvoicesByShop();
      }
    }, 400);
  }


} 