import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, ViewChild, OnDestroy, NgZone, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
// QRCode is imported dynamically to reduce bundle size
// import QRCode from 'qrcode';
import { GymCheckinActionsComponent } from './gym-checkin-actions/gym-checkin-actions.component';
import { MatIconModule } from '@angular/material/icon';
import { ShopService } from 'src/app/services/shop.service';
import { ResponseDate } from 'src/app/app.component';
import { SweatAlertService } from 'src/app/services/sweat-alert.service';
import { AblyService } from 'src/app/services/ably.service';
import { Subscription } from 'rxjs';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gym-check-in',
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule],
  templateUrl: './gym-check-in.component.html',
  styleUrls: ['./gym-check-in.component.scss'] // Added SCSS file reference
})
export class GymCheckInComponent implements OnInit, AfterViewInit, OnDestroy {

  private subscription?: Subscription;
  private isSubscribed: boolean = false;
  dialog = inject(MatDialog);
  shopService = inject(ShopService);
  organizationService = inject(OrganizationServiceService);
  highlightedPart = 'quads'

  text: string = 'Hello World';
  qrCodeDataUrl: string | null = null;

  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;
  router = inject(Router);
  route = inject(ActivatedRoute);

  constructor(private swalService: SweatAlertService, private ablyService: AblyService, private zone: NgZone) {
  }

  ngOnInit() {
    console.log('GymCheckInComponent ngOnInit');
    // Ensure Ably is initialized and subscribe to messages
    this.ensureAblyInitialization().then(() => {
      this.setupAblySubscription();
    });
  }

  ngAfterViewInit() {
    console.log('GymCheckInComponent ngAfterViewInit');
    // Initialize QR code
    this.generateQRCode();
  }

  ngOnDestroy() {
    console.log('GymCheckInComponent ngOnDestroy');
    this.cleanupSubscription();
  }

  private cleanupSubscription(): void {
    if (this.subscription && !this.subscription.closed) {
      console.log('Cleaning up existing subscription');
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
  }

  /**
   * Ensure Ably service is initialized
   */
  private async ensureAblyInitialization(): Promise<void> {
    console.log('Ensuring Ably initialization');
    // If not initialized and we have a shop code, initialize it
    const shopCode = localStorage.getItem("shopCode");
    console.log('Shop code from localStorage:', shopCode);

    if (shopCode) {
      try {
        // Initialize the Ably service with the API key
        // Note: We don't set the shop code here since BusinessLayoutComponent already manages it
        console.log('Initializing Ably service');
        this.ablyService.initialize("Ek4x8A.f1K1KA:QOg5QxJ5pCLKTD7MAbgHej3gaUhr07MXxLb6XzKiAu4");
        // Just verify the shop code is set in the service
        if (!this.ablyService['shopCodeSubject'].getValue()) {
          console.log('Shop code not set in service, setting it now');
          this.ablyService.setShopCode(shopCode);
        }
      } catch (error) {
        console.error('Error initializing Ably service:', error);
      }
    } else {
      console.warn('No shop code found in localStorage');
    }
  }

  /**
   * Setup Ably subscription with proper error handling and retry mechanism
   */
  private setupAblySubscription(): void {
    console.log('Setting up Ably subscription');
    try {
      // Clean up any existing subscription to prevent multiple subscriptions
      this.cleanupSubscription();

      // Subscribe to gym-checkin messages
      console.log('Creating new subscription for gym-checkin messages');
      this.subscription = this.ablyService.onMessage('gym-checkin').subscribe({
        next: (msg) => {
          console.log('GymCheckIn received message:', msg.data);
          this.openCheckInDialog(msg.data);
        },
        error: (err) => {
          console.error('Error in gym-checkin subscription:', err);
          // Optionally implement retry logic here
        }
      });
      console.log('Ably subscription set up successfully');
    } catch (error) {
      console.error('Failed to setup Ably subscription:', error);
    }
  }

  async generateQRCode() {
    let shopCode = localStorage.getItem("shopCode");
    console.log('Generating QR code for shop code:', shopCode);

    // Use larger size for desktop screens
    const isLargeScreen = window.innerWidth >= 1024;
    const qrSize = isLargeScreen ? 400 : 280;

    // Dynamically import qrcode to reduce initial bundle size
    // Handle different export formats that may occur in production builds
    const QRCodeModule = await import('qrcode');

    // Different ways the module might be exported
    const toCanvasFunc = QRCodeModule.toCanvas || QRCodeModule.default?.toCanvas || QRCodeModule["default"];

    if (toCanvasFunc && typeof toCanvasFunc === 'function') {
      toCanvasFunc(this.qrCanvas.nativeElement, shopCode || '', {
        width: qrSize,
        margin: 2
      }).catch((err: any) => console.error('QR Code generation error:', err));
    } else {
      console.error('Could not find toCanvas function in QRCode module');
      // Fallback: try direct call if the default export is the function itself
      const defaultExport = QRCodeModule.default;
      if (defaultExport && typeof defaultExport === 'function') {
        // If default export is the function, we might need to handle differently
        console.warn('Using fallback QR code generation');
      }
    }
  }

  muscleColors: { [key: string]: string } = {
    calves: 'gray',
    quads: 'gray',
    abdominals: 'gray',
    obliques: 'gray'
  };

  openCheckIn() {
    setTimeout(() => {
      const dialogRef = this.dialog.open(GymCheckinActionsComponent, {
        data: {}
      });

      dialogRef.afterClosed().subscribe((result: PaymentResponse) => {
        if (result) {

        }
      });
    }, 1000);

  }

  openCheckInDialog(checkinInfo: any) {
    console.log('Opening check-in dialog with data:', checkinInfo);

    // Use the actual incoming data instead of hardcoded sample data
    const data = {
      "customerDTO": checkinInfo.customerDTO,
      "streak": checkinInfo.streak,
      "remainingDays": checkinInfo.remainingDays,
      "weeklyAttendance": checkinInfo.weeklyAttendance,
      "membershipPlanName": checkinInfo.membershipPlanName,
      "isCheckIn": checkinInfo.isCheckIn,
      "todoDto": checkinInfo.todoDto
    };

    const dialogRef = this.dialog.open(GymCheckinActionsComponent, {
      data: data
    });

    dialogRef.afterClosed().subscribe((result: PaymentResponse) => {
      if (result) {

      }
    });
  }

  // Attendance 
  typedText = '';

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {

    if (event.key.length === 1) {
      // this.typedText += event.key;
    } else if (event.key === 'Backspace') {
      // this.typedText = this.typedText.slice(0, -1);
    } else if (event.key === 'Enter') {
      this.submitCheckIn(this.typedText);
      this.typedText = ''; // clear after submit
    }
  }

  submitCheckIn(code: string) {
    // Restrict empty API calls - require at least 1 character
    if (!code || code.trim().length < 1) {
      console.log('Check-in code must be at least 1 character, skipping API call');
      return;
    }

    console.log('Getting customer with code:', code);

    // First, get the customer by ID
    const customerId = parseInt(code, 10);
    if (isNaN(customerId)) {
      console.log('Invalid customer ID provided:', code);
      this.swalService.error('Invalid customer ID');
      return;
    }

    this.organizationService.getCustomerByOrgAndShopAndId(customerId).subscribe({
      next: (customerRes: ResponseDate) => {
        console.log('Customer data received:', customerRes);

        // Check if the response contains a list of customers
        if (Array.isArray(customerRes.data) && customerRes.data.length > 1) {
          // Multiple customers returned - show selection dialog
          this.showCustomerSelectionDialog(customerRes.data);
        } else {
          // Single customer returned - proceed with check-in
          this.swalService.error('We couldn’t find the customer ID. Please check with the trainer.');
        }
      },
      error: (err: any) => {
        console.error('Error getting customer:', err);
        if (err.status === 400 || err.status === 404) {
          this.swalService.error(err.error?.message || 'Customer not found');
        } else {
          this.swalService.error("Something Went Wrong getting customer!");
        }
      }
    });
  }

  tempCustomers: any[] = [];

  showCustomerSelectionDialog(customers: any[]) {
    // Store customers in component instance
    this.tempCustomers = customers;

    // Create HTML for customer selection
    let customerListHtml = '<div class="customer-selection-list" style="max-height: 300px; overflow-y: auto; text-align: left;">';

    customers.forEach((customer, index) => {
      const name = customer.firstName || customer.lastName ?
        `${customer.firstName || ''} ${customer.lastName || ''}`.trim() :
        customer.email || customer.contactNumber || `Customer #${customer.id}`;

      customerListHtml += `
        <div class="customer-item" style="padding: 15px; margin: 8px 0; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; background-color: #f9f9f9; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
             onclick="selectCustomer(${index})">
          <strong style="color: #333;">${name}</strong>
          <div style="font-size: 0.9em; color: #666; margin-top: 5px;">
            ${customer.email ? `<div>Email: ${this.maskEmail(customer.email)}</div>` : ''}
             ${customer.contactNumber ? `<div>Phone: ${this.maskPhone(customer.contactNumber)}</div>` : ''}
          </div>
        </div>
      `;
    });

    customerListHtml += '</div>';

    // Global function to handle customer selection
    (window as any).selectCustomer = (index: number) => {
      Swal.close();
      const selectedCustomer = this.tempCustomers[index];
      this.proceedWithCheckIn(selectedCustomer.id);
    };

    // Show the customer selection dialog
    Swal.fire({
      title: 'Select Customer',
      html: customerListHtml,
      showCancelButton: true,
      showConfirmButton: false,
      width: '600px'
    });
  }

  maskEmail(email:string) {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (name.length <= 2) return `**@${domain}`;
    return `${name.slice(0, 3)}${'*'.repeat(name.length - 2)}@${domain}`;
  }

  maskPhone(phone: string) {
    if (!phone) return '';
    if (phone.length <= 4) return '*'.repeat(phone.length);
    return `${phone.slice(0, 3)}${'*'.repeat(phone.length - 4)}${phone.slice(-2)}`;
  }

  proceedWithCheckIn(customerId: number) {
    console.log('Submitting check-in with customer ID:', customerId);
    this.shopService.PostMembershipCheckIn(customerId.toString()).subscribe({
      next: (res: ResponseDate) => {
        console.log('Check-in response:', res);
        this.openCheckInDialog(res.data);
      },
      error: (err: any) => {
        if (err.status === 400) {
          this.swalService.error(err.error.message);
        } else {
          this.swalService.error("Something Went Wrong!");
        }
      }
    });
  }
}