import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Customer } from 'src/app/models/customer.model';
import { Category, Item } from 'src/app/models/shop.model';
import { PosActionsComponent } from './pos-actions/pos-actions.component';
import { AddCustomerComponent } from '../add-customer/add-customer.component';
import { ShopService } from 'src/app/services/shop.service';
import { ResponseDate } from 'src/app/app.component';
import { GodBoxComponent } from '../god-box/god-box.component';
import { InvoiceModel, ItemModel, PaymentResponse } from 'src/app/models/payment.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, CommonModule, FormsModule],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class PosComponent {



  closeDialog() {
    this.dialogRef.close();

  }











  // <-- --> 
  // Categories
  categories: Category[] = [
    { id: 'memberships', name: 'Memberships', icon: 'card_membership' }, // 'award' → 'card_membership'
    // { id: 'services', name: 'Services', icon: 'build' },           // 'settings' → 'build'
    // { id: 'packages', name: 'Packages', icon: 'inventory_2' },    // 'package' → 'inventory_2'
    // { id: 'products', name: 'Products', icon: 'shopping_bag' },   // Material icon
    // { id: 'rentals', name: 'Rentals', icon: 'access_time' }       // 'clock' → 'access_time'
  ];
  activeCategory: string = 'memberships';
  dialog = inject(MatDialog);
  private _snackBar = inject(NzMessageService);
  // Mobile menu
  showMobileMenu: boolean = true;


  get activeCategoryName(): string {
    const category = this.categories.find(c => c.id === this.activeCategory);
    return category ? category.name : '';
  }

  // Items
  items: Record<string, Item[]> = {
    services: [],
    memberships: [],
    packages: [],
    products: [],
    rentals: [],
  };

  // Search
  searchQuery: string = '';
  get filteredItems(): Item[] {
    const categoryItems = this.items[this.activeCategory] || [];
    if (!this.searchQuery) return categoryItems;
    return categoryItems.filter(item =>
      item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Cart
  cart: Item[] = [];

  addToCart(item: Item) {

    const existing = this.cart.find(i => i.id === item.id);
    if (existing) {
      existing.quantity! += 1;
    } else {
      console.log(this.activeCategoryName);
      if (this.activeCategoryName === "Memberships") {
        // Open start date dialog
        const dialogRef = this.dialog.open(PosActionsComponent, {
          disableClose: true, data: { type: "MEMBERSHIP_START_DATE_PICKER", name: "Membership Start Date" }
        });
        let priceDetails: {
          "taxRate": number,
          "basePrice": number
        };
        this.shopService.getCurrentMembership(item.id).subscribe({
          next: (res: ResponseDate) => {
            priceDetails = res.data;
            if (item.basePrice != priceDetails.basePrice) {

            }
            item.taxRate = priceDetails.taxRate;
            item.basePrice = priceDetails.basePrice;
          },
          error: (err: any) => {

          }
        })

        // Wait for the user to select a date
        dialogRef.afterClosed().subscribe((selectedDate: Date) => {
          if (selectedDate) {
            console.log("Selected start date:", selectedDate);

            // Add item with start date to cart
            this.cart.push({
              ...item,
              quantity: 1,
              startDate: selectedDate
            });
          } else {
            console.log("User cancelled date selection");
          }
        });
      } else {
        // Other categories: just add normally
        this.cart.push({ ...item, quantity: 1 });
      }
    }
  }

  updateQuantity(index: number, delta: number) {
    const newQty = this.cart[index].quantity! + delta;
    if (newQty > 0) this.cart[index].quantity = newQty;
    else this.cart.splice(index, 1);
  }

  removeFromCart(index: number) {
    this.cart.splice(index, 1);
  }

  // Cart totals
  get subtotal(): number {
    return this.cart.reduce((sum, item) => sum + (item.basePrice * (item.quantity || 1)), 0);
  }

  get tax(): number {
    return this.cart.reduce((sum, item) => {
      const rate = item.taxRate ?? 0;
      return sum + (item.basePrice * (item.quantity || 1) * (rate / 100));
    }, 0);
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  get invoiceButtonText(): string {
    return this.invoice.invoiceNumber ? 'Update Invoice' : 'Create Invoice';
  }

  get customerName(): string {
    const c = this.selectedCustomer;
    if (!c) return "";

    const name = c.firstName?.trim() || "(Online Customer)";
    const contact = c.email || c.contactNumber || "(No Contact)";
    return `${name} 📧 ${contact}`;
  }
  // Customer management
  showNewCustomerForm: boolean = false;
  newCustomer: Customer = { firstName: '', contactNumber: '', email: '' };
  currentCustomer: Customer | null = null;

  // Selected Customer
  selectedCustomer!: Customer;

  addCustomerMannually(): void {
    const dialogRef = this.dialog.open(AddCustomerComponent, {
      data: {}, minWidth: "360px"
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  // Payment
  showPaymentModal: boolean = false;
  paymentMethods: string[] = ['Credit Card', 'Cash', 'Digital Wallet', 'Bank Transfer'];
  selectedPaymentMethod: string = 'Credit Card';

  processPayment() {
    if (this.cart.length === 0) return;
    this.showPaymentModal = true;
  }
  completePayment() {
    this.showPaymentModal = false;
    this.showReceipt = true;
  }

  // Receipt
  showReceipt: boolean = false;
  generateTransactionId(): string {
    return 'TRX-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  }
  printReceipt() {
    window.print();
  }
  closeReceipt() {
    this.showReceipt = false;
    this.cart = [];
    this.currentCustomer = null;
  }

  // Helper for payment icons
  getPaymentIcon(method: string): string {
    switch (method) {
      case 'Credit Card': return 'credit-card';
      case 'Cash': return 'dollar-sign';
      case 'Digital Wallet': return 'smartphone';
      case 'Bank Transfer': return 'bank';
      default: return 'credit-card';
    }
  }

  constructor(private dialogRef: MatDialogRef<PosComponent>, @Inject(MAT_DIALOG_DATA) public data: { existingInvoice: InvoiceModel }) {


    console.log(this.invoice);

  }

  placeHolderImg = 'https://seanl80.sg-host.com/wp-content/uploads/woocommerce-placeholder-600x600.png'
  shopService = inject(ShopService);

  onCategoryChange(categoryId: string) {
    this.activeCategory = categoryId;
    const category = this.categories.find(c => c.id === this.activeCategory);
    if (category?.name == "Memberships") {
      this.getMembershipByShop();
    }
  }

  openGodBoxCustomer() {
    const dialogRef = this.dialog.open(GodBoxComponent, {
      data: {}, minWidth: "360px"
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);

      if (this.isUserDto(result)) {
        this.selectedCustomer = result;
      }
    });
  }



  isUserDto(obj: any): obj is Customer {
    return obj && typeof obj.id === 'number' && (typeof obj.firstName === 'string' || typeof obj.email === 'string' || typeof obj.contactNumber === 'number');
  }

  // Invoice
  invoice: InvoiceModel = {
    customerId: NaN,
    discount: 0,
    items: [],
    invoiceNumber: undefined,
    status: undefined,
  };

  createInvoice() {
    if (this.cart.length < 1) {
      this._snackBar.error("Cart is empty!");
      return;
    }
    if (!this.selectedCustomer) {
      this._snackBar.error("Select customer to create invoice");
      return;
    }

    const invoice: InvoiceModel = {
      customerId: this.selectedCustomer.id!,
      discount: 0.0,
      items: [],
    };

    this.cart.forEach((cart: Item) => {
      let cartItem: ItemModel = {
        itemType: cart.itemType,
        itemName: cart.name,
        itemId: cart.id,
        quantity: cart.quantity!,
      }
      if (cartItem.itemType == "MEMBERSHIPS") {
        // const timestamp = new Date("2025-09-08").getTime();
        cartItem.startDate = cart.startDate?.getTime();
      }
      invoice.items.push(cartItem);
    });

    this.shopService.createInvoice(invoice).subscribe({
      next: (res: ResponseDate) => {
        this._snackBar.success("Invoice Created");
        console.log(res.data);
        this.invoice = res.data;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        this.askForPayment();
      },
      error: (err: any) => {

      }
    })
  }

  askForPayment() {

    Swal.fire({
      title: "Do you want to proceed to payment or keep the invoice open?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Proceed to Payment",
      cancelButtonText: "Keep Open"
    }).then((result) => {
      if (result.isConfirmed) {
        this.handleAction("Issue Invoice", this.invoice);
        this.handleAction("Record Payment", this.invoice);
      } else {
        // Swal.fire("Action cancelled", "", "warning");
        this.dialogRef.close();
      }
    });
  }

  firePoppers() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10001'; // above SweetAlert
    document.body.appendChild(canvas);

    const myConfetti = confetti.create(canvas, { resize: true });

    myConfetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  ngOnInit(): void {
    if (this.activeCategory == "memberships") {
      this.getMembershipByShop();
    }

    if (this.data && this.data.existingInvoice) {

      this.invoice = this.data.existingInvoice;
      this.cart = this.invoice.items.map(i => this.normalizeInvoiceItem(i));
      this.selectedCustomer = this.invoice.customer!;
    }


  }

  private normalizeInvoiceItem(dbItem: any): Item {
    return {
      id: dbItem.id,
      name: dbItem.itemName,
      description: '', // not provided by invoice, maybe fetch separately?
      basePrice: dbItem.price,
      quantity: dbItem.quantity,
      taxRate: dbItem.taxRate,
      itemType: dbItem.itemType,
      image: '', // not present in invoice response, you might load it from master list
    };
  }

  getMembershipByShop() {
    this.shopService.getAllShopMembership().subscribe({
      next: (res: ResponseDate) => {
        res.data.forEach((mem: Item) => {
          mem.itemType = "MEMBERSHIPS"
        });
        this.items = {
          ...this.items,
          ['memberships']: res.data
        };

      },
      error: (err: any) => {

      }
    })
  }


  // 🛠️ Helper Methods → Utility functions, formatters, mappers

  actionsByStatus: Record<string, string[]> = {
    DRAFT: ['Update Invoice', 'Issue Invoice', 'Cancel Invoice'],
    ISSUED: ['Record Payment', 'Cancel Invoice'],
    PARTIALLY_PAID: ['Record Payment', 'Cancel Invoice'],
    PAID: [], // 'Download Invoice', 'Refund'
    CANCELLED: []
  };

  actionButtonClasses: Record<string, string> = {
    'Update Invoice': 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    'Issue Invoice': 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    'Cancel Invoice': 'bg-red-100 text-red-700 hover:bg-red-200',
    'Record Payment': 'bg-green-300 text-amber-700 hover:bg-green-400',
    'Download Invoice': 'bg-green-100 text-green-700 hover:bg-green-200',
    Refund: 'bg-pink-100 text-pink-700 hover:bg-pink-200'
  };

  getAvailableActions(status: string): string[] {
    return this.actionsByStatus[status] || [];
  }

  handleAction(action: string, invoice: any) {
    switch (action) {
      case 'Update Invoice':
        this.editInvoice(invoice);
        break;
      case 'Issue Invoice':
        this.issueInvoice(invoice, "ISSUED");
        break;
      case 'Cancel Invoice':
        this.cancelInvoice(invoice, "CANCELLED");
        break;
      case 'Record Payment':
        this.recordPayment(invoice);
        break;
      case 'Download Invoice':
        this.downloadInvoice(invoice);
        break;
      case 'Refund':
        this.refundInvoice(invoice);
        break;
    }
  }

  // example stubs
  editInvoice(invoice: any) {
    console.log('Editing invoice', invoice);
  }

  issueInvoice(invoice: InvoiceModel, status: string) {
    this.shopService.updateInvoiceStatus(invoice.id, status).subscribe({
      next: (res: ResponseDate) => {
        this.invoice = res.data;
      },
      error: (err: any) => {

      }
    })
  }

  getInvoiceById(invoiceId: number) {
    this.shopService.getInvoiceById(invoiceId).subscribe({
      next: (res: ResponseDate) => {
        this.invoice = res.data;
      },
      error: (err: any) => {

      }
    })
  }


  cancelInvoice(invoice: any, status: string) {
    this.shopService.updateInvoiceStatus(invoice.id, status).subscribe({
      next: (res: ResponseDate) => {
        this.invoice = res.data;
      },
      error: (err: any) => {

      }
    })
  }

  recordPayment(invoice: any) {
    const dialogRef = this.dialog.open(PosActionsComponent, {
      disableClose: true, data: { type: "RECORD_PAYMENT", name: "Confirm Payment", invoice: invoice }
    });

    dialogRef.afterClosed().subscribe((result: PaymentResponse) => {
      if (result) {
        if (result.status == "COMPLETED") {
          this.firePoppers();
          this._snackBar.success("Payment Completed");
          this.getInvoiceById(result.invoiceId);
        }
      }
    });

  }

  downloadInvoice(invoice: any) {
    console.log('Downloading invoice', invoice);
  }

  refundInvoice(invoice: any) {
    console.log('Refunding invoice', invoice);
  }

}
