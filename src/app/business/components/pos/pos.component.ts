import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, HostListener, Inject, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { toBlob } from 'html-to-image';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
import { SweatAlertService } from 'src/app/services/sweat-alert.service';
import { DiscountDialogComponent } from './discount-dialog/discount-dialog.component';
import { CustomerMembershipComponent } from '../../customers/customer-membership/customer-membership.component';
import { CustomerGeneralComponent } from '../../customers/customer-general/customer-general.component';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, CommonModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class PosComponent implements OnInit {

  @ViewChild('invoiceCard') invoiceCard!: ElementRef;
  processing: boolean = false;

  shopCode: any;
  constructor(private dialogRef: MatDialogRef<PosComponent>, @Inject(MAT_DIALOG_DATA) public data: { existingInvoice: InvoiceModel }, private swal: SweatAlertService) {
    console.log(this.data, 'existingInvoice');
  }

  placeHolderImg = 'https://seanl80.sg-host.com/wp-content/uploads/woocommerce-placeholder-600x600.png'
  shopService = inject(ShopService);

  // Responsive properties
  isMobile: boolean = false;
  isTablet: boolean = false;
  isCartVisible: boolean = true;
  viewMode: 'grid' | 'table' = 'table';

  closeDialog() {
    this.dialogRef.close();
  }

  // Toggle cart visibility for mobile/tablet
  toggleCartVisibility() {
    this.isCartVisible = !this.isCartVisible;
  }

  // Check screen size on resize
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  // Check screen size on init
  checkScreenSize() {
    const width = window.innerWidth;
    this.isMobile = width < 768;
    this.isTablet = width >= 768 && width < 1024;

    // On mobile/tablet, hide cart by default
    if (this.isMobile || this.isTablet) {
      this.isCartVisible = false;
    } else {
      this.isCartVisible = true;
    }
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
    let result = categoryItems;

    if (this.searchQuery) {
      result = categoryItems.filter(item =>
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    return [...result].sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
  }

  // Cart
  cart: Item[] = [];

  // Order-level discount
  orderDiscount: number = 0;

  addToCart(item: Item) {

    const existing = this.cart.find(i => i.id === item.id);

    if (existing) {
      existing.quantity! += 1;
    } else {
      console.log(this.activeCategoryName);
      if (this.activeCategoryName === "Memberships") {
        // Open start date dialog
        const existing = this.cart.find(i => i.type === "MEMBERSHIPS");
        if (existing) {
          this._snackBar.create('error', 'You already have a membership in cart. Please remove it first.');
          return;
        }

        if (this.hasPendingMembership) {
          this.swal.error('This customer already has a pending membership. Please activate or cancel it before buying a new one.');
          return;
        }


        let minDate: Date | undefined = undefined;
        if (!this.isMembershipExpired && this.selectedCustomer?.membershipExpiry) {
          const expiryDate = new Date(this.selectedCustomer.membershipExpiry);
          expiryDate.setDate(expiryDate.getDate() + 1);
          minDate = expiryDate;
        }

        const dialogRef = this.dialog.open(PosActionsComponent, {
          disableClose: true, data: { type: "MEMBERSHIP_START_DATE_PICKER", name: "Membership Start Date", minDate: minDate }
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
              name: item.name + (item.durationLabel ? ` (${item.durationLabel})` : ''),
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

  editStartDate(index: number) {
    if (this.invoice.invoiceNumber) return;

    let minDate: Date | undefined = undefined;
    if (!this.isMembershipExpired && this.selectedCustomer?.membershipExpiry) {
      const expiryDate = new Date(this.selectedCustomer.membershipExpiry);
      expiryDate.setDate(expiryDate.getDate() + 1);
      minDate = expiryDate;
    }

    const dialogRef = this.dialog.open(PosActionsComponent, {
      disableClose: true,
      data: { type: "MEMBERSHIP_START_DATE_PICKER", name: "Update Membership Start Date", minDate: minDate }
    });

    dialogRef.afterClosed().subscribe((selectedDate: Date) => {
      if (selectedDate) {
        this.cart[index].startDate = selectedDate;
      }
    });
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
    return this.subtotal + this.tax - this.orderDiscount - this.paidAmount;
  }

  get grandTotal(): number {
    return this.subtotal + this.tax - this.orderDiscount;
  }

  get paidAmount(): number {
    if (!this.invoice || !this.invoice.payments || this.invoice.payments.length === 0) return 0;
    return this.invoice.payments.reduce((sum, p) => sum + (p.amount || p.paidAmount || 0), 0);
  }

  openDiscountDialog() {
    const dialogRef = this.dialog.open(DiscountDialogComponent, {
      minWidth: '500px',
      data: {
        subtotal: this.subtotal,
        currentDiscount: this.orderDiscount
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.orderDiscount = result.amount;
        this._snackBar.success('Discount of ' + this.orderDiscount + ' applied');
      }
    });
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

  get isMembershipExpired(): boolean {
    if (!this.selectedCustomer?.membershipExpiry) return true;
    return new Date(this.selectedCustomer.membershipExpiry).getTime() < new Date().getTime();
  }
  // Customer management
  showNewCustomerForm: boolean = false;
  newCustomer: Customer = { firstName: '', contactNumber: '', email: '' };
  currentCustomer: Customer | null = null;

  // Selected Customer
  selectedCustomer?: Customer;
  hasPendingMembership: boolean = false;

  deselectCustomer() {
    this.selectedCustomer = undefined;
    this.hasPendingMembership = false;
  }

  openMembershipDialog() {
    if (!this.selectedCustomer) return;

    const dialogRef = this.dialog.open(CustomerMembershipComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { customer: this.selectedCustomer }
    });

    dialogRef.afterClosed().subscribe(() => {
      if (this.selectedCustomer?.id) {
        this.fetchCustomerMembership(this.selectedCustomer.id);
      }
    });
  }

  addCustomerMannually(): void {
    const dialogRef = this.dialog.open(AddCustomerComponent, {
      data: {}, minWidth: "360px"
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if (this.isUserDto(result)) {
        this.selectedCustomer = result;
        this.fetchCustomerMembership(result.id!);
      }
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
    this.deselectCustomer();
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



  openGodBoxCustomer() {
    const dialogRef = this.dialog.open(GodBoxComponent, {
      data: {}, minWidth: "360px"
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);

      if (this.isUserDto(result)) {
        this.selectedCustomer = result;
        this.fetchCustomerMembership(result.id!);
      }
    });
  }

  onCategoryChange(categoryId: string) {
    this.activeCategory = categoryId;
    const category = this.categories.find(c => c.id === this.activeCategory);
    if (category?.name == "Memberships") {
      this.getMembershipByShop();
    }
  }

  openCustomerGeneralDialog() {
    if (!this.selectedCustomer) return;
    this.dialog.open(CustomerGeneralComponent, {
      width: '1000px',
      maxHeight: '95vh',
      data: { customer: this.selectedCustomer }
    });
  }

  fetchCustomerMembership(customerId: number, openGeneralIfActive: boolean = false) {
    this.shopService.getCustomerMembershipDetails(customerId).subscribe({
      next: (res: any) => {
        if (res.data && res.data.length > 0) {
          // Filter only active memberships
          const activeMemberships = res.data.filter((m: any) => m.status === 'ACTIVE');
          const pendingMemberships = res.data.filter((m: any) => m.status === 'PENDING');
          this.hasPendingMembership = pendingMemberships.length > 0;

          if (activeMemberships.length > 0) {
            // Find latest active membership by expiry date
            const latest = activeMemberships.reduce((prev: any, current: any) => {
              return (new Date(prev.endDate) > new Date(current.endDate)) ? prev : current;
            });

            if (this.selectedCustomer && this.selectedCustomer.id === customerId) {
              this.selectedCustomer.membershipName = latest.planName;
              this.selectedCustomer.membershipExpiry = latest.endDate;
            }

            // If requested and active, open the general profile dialog
            if (openGeneralIfActive) {
              this.openCustomerGeneralDialog();
            }
          } else {
            // Clear if no active membership found
            if (this.selectedCustomer && this.selectedCustomer.id === customerId) {
              this.selectedCustomer.membershipName = undefined;
              this.selectedCustomer.membershipExpiry = undefined;
            }
          }
        } else {
          this.hasPendingMembership = false;
        }
      },
      error: (err: any) => {
        console.error('Error fetching customer membership info:', err);
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
      discount: this.orderDiscount,
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
        this.invoice = res.data;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        this.askForPayment();
      },
      error: (err: any) => {
        console.log(err.error.message);
        this.swal.error(err.error.message);
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

  shopName: string = "";

  ngOnInit(): void {
    this.shopCode = localStorage.getItem('shopCode');

    this.shopName = localStorage.getItem("shopName") || this.shopCode;
    // Check screen size on component initialization
    this.checkScreenSize();


    if (this.activeCategory == "memberships" && this.shopCode) {
      this.getMembershipByShop();
    } else {
      setTimeout(() => {
        this.closeDialog();
      }, 2000);
    }

    if (this.data && this.data.existingInvoice) {
      this.invoice = this.data.existingInvoice;
      this.cart = this.invoice.items.map(i => this.normalizeInvoiceItem(i));
      this.selectedCustomer = this.invoice.customer!;
      if (this.selectedCustomer?.id) {
        this.fetchCustomerMembership(this.selectedCustomer.id);
      }
      // Load the discount from existing invoice
      this.orderDiscount = this.invoice.discount || 0;
    } else {
      // Auto-open GodBox if starting a new invoice
      // setTimeout(() => {
      //   this.openGodBoxCustomer();
      // }, 500);
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
      startDate: dbItem.scheduledStart ? new Date(dbItem.scheduledStart) : undefined
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
          ['memberships']: this.transformMembership(res.data)
        };

        console.log(this.items, ".Memberships");

      },
      error: (err: any) => {

      }
    })
  }

  transformMembership(data: any) {
    if (!data) return [];

    return data.map((membership: any) => {

      membership.type = "MEMBERSHIPS";
      const durationBenefits = membership.benefits?.filter(
        (b: any) =>
          b.benefitType === 'DURATION_ACCESS' &&
          b.durationValue &&
          b.durationUnit
      ) || [];

      if (!durationBenefits.length) {
        return membership; // no null (avoid type issue)
      }

      const longest = durationBenefits.reduce((max: any, item: any) => {
        const currentDays = this.convertToDays(item.durationValue, item.durationUnit);
        const maxDays = this.convertToDays(max.durationValue, max.durationUnit);
        return currentDays > maxDays ? item : max;
      });

      const durationLabel =
        `${longest.durationValue}-${this.capitalize(longest.durationUnit)}`;

      return {
        ...membership,
        durationLabel
      };
    });
  }


  capitalize(unit: string): string {
    return unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase();
  }

  convertToDays(value: number, unit: string): number {
    switch (unit) {
      case 'DAY': return value;
      case 'WEEK': return value * 7;
      case 'MONTH': return value * 30;   // approximate
      case 'YEAR': return value * 365;   // approximate
      default: return 0;
    }
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
      disableClose: true, data: { type: "RECORD_PAYMENT", name: "Confirm Payment", invoice: invoice, payableAmount: this.total }
    });

    dialogRef.afterClosed().subscribe((result: PaymentResponse) => {
      if (result) {
        console.log(result, "payment response");

        if (result.status == "COMPLETED") {
          this.firePoppers();
          this._snackBar.success("Payment Completed");
          this.getInvoiceById(result.invoiceId);
          if (this.selectedCustomer?.id) {
            this.fetchCustomerMembership(this.selectedCustomer.id, true);
          }
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

  async sendInvoiceOnWhatsapp() {
    if (!this.invoice || !this.invoice.invoiceNumber) {
      this._snackBar.error("Please create an invoice first!");
      return;
    }

    if (!this.selectedCustomer || (!this.selectedCustomer.phone && !this.selectedCustomer.contactNumber)) {
      this._snackBar.error("Customer contact number is missing!");
      return;
    }

    await this.prepareInvoiceImage();
  }

  async prepareInvoiceImage() {
    this.processing = true;
    const element = this.invoiceCard.nativeElement;

    // Temporarily remove off-screen positioning to capture properly
    const originalStyle = element.style.cssText;
    element.style.position = 'fixed';
    element.style.left = '0';
    element.style.top = '0';
    element.style.zIndex = '-1';
    element.style.visibility = 'visible';

    try {
      const blob = await toBlob(element, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        skipFonts: true
      });

      // Restore style
      element.style.cssText = originalStyle;

      if (!blob) throw new Error('Image generation failed');

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      await Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Opening WhatsApp...',
        timer: 1500,
        showConfirmButton: false
      });

      // ✅ Open WhatsApp
      const rawNumber = this.selectedCustomer!.phone || this.selectedCustomer!.contactNumber;
      const phoneNumber = rawNumber!.toString().replace("+", '');
      // Prepare dynamic message content
      const customerName = this.selectedCustomer?.firstName || 'Valued Member';
      const shopName = localStorage.getItem("shopName") || '';

      // Find membership details if available
      const membershipItem = this.invoice.items?.find(i => i.itemType === 'MEMBERSHIPS');
      const planName = membershipItem?.itemName || this.selectedCustomer?.membershipName || 'Membership Plan';

      const endDate = this.selectedCustomer?.membershipExpiry
        ? new Date(this.selectedCustomer.membershipExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'N/A';

      const messageContent = `Hi ${customerName}\n` +
        `Please find your membership invoice below!\n` +
        `Plan: ${planName}\n` +
        `End Date: ${endDate}\n` +
        `Thank you for being a valued member!\n` +
        `– ${shopName}`;

      const message = encodeURIComponent(messageContent);

      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

      window.open(whatsappUrl, '_blank');
      this.processing = false;

    } catch (error) {
      element.style.cssText = originalStyle;
      this.processing = false;
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to generate invoice image.'
      });
    }
  }

  printInvoice() {
    if (!this.invoice || !this.invoice.invoiceNumber) {
      this._snackBar.error("Please create an invoice first!");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = this.invoiceCard.nativeElement.outerHTML;
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${this.invoice.invoiceNumber}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print {
                body { margin: 20mm; }
              }
            </style>
          </head>
          <body>
            <div id="print-area">
              ${printContent}
            </div>
            <script>
              setTimeout(() => {
                const element = document.querySelector('#print-area > div');
                if (element) {
                   element.style.position = 'relative';
                   element.style.left = '0';
                   element.style.top = '0';
                   element.style.visibility = 'visible';
                }
                window.print();
                window.close();
              }, 1000);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }
}