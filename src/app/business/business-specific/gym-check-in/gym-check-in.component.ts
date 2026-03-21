import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, ViewChild, OnDestroy, NgZone, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
import { MatRippleModule } from '@angular/material/core';
import { Subscription } from 'rxjs';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gym-check-in',
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule, MatRippleModule],
  templateUrl: './gym-check-in.component.html',
  styleUrls: ['./gym-check-in.component.scss'] // Added SCSS file reference
})
export class GymCheckInComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoading: any = false;
  submitCode() {
    this.submitCheckIn(this.typedText);
    this.typedText = '';
  }

  private subscription?: Subscription;
  private isSubscribed: boolean = false;
  dialog = inject(MatDialog);
  shopService = inject(ShopService);
  organizationService = inject(OrganizationServiceService);
  highlightedPart = 'quads'

  text: string = 'Hello World';
  qrCodeDataUrl: string | null = null;

  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  router = inject(Router);
  route = inject(ActivatedRoute);

  playableItems: any[] = [];
  currentAdIndex: number = 0;
  carouselTimer: any;
  shopText = "Scan to Check In"

  constructor(private swalService: SweatAlertService, private ablyService: AblyService, private zone: NgZone, private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    let shopName = localStorage.getItem("shopName");
    if (shopName) {
      this.shopText = shopName + " Attendance"
    }
    console.log('GymCheckInComponent ngOnInit');
    // Ensure Ably is initialized and subscribe to messages
    this.ensureAblyInitialization().then(() => {
      this.setupAblySubscription();
    });
    this.loadAdvertisements();
  }

  ngAfterViewInit() {
    console.log('GymCheckInComponent ngAfterViewInit');
    // Initialize QR code
    this.generateQRCode();
  }

  ngOnDestroy() {
    console.log('GymCheckInComponent ngOnDestroy');
    this.cleanupSubscription();
    if (this.carouselTimer) {
      clearTimeout(this.carouselTimer);
    }
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

  addDigit(n: number) {
    this.typedText += n.toString();
  }

  removeDigit() {
    this.typedText = this.typedText.slice(0, -1);
  }

  submitCheckIn(code: string) {
    // Restrict empty API calls - require at least 1 character
    if (!code || code.trim().length < 1) {
      console.log('Check-in code must be at least 1 character, skipping API call');
      this.swalService.error('Check-in code must be at least 1 character');
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
    this.isLoading = true;
    this.organizationService.getCustomerByOrgAndShopAndId(customerId).subscribe({
      next: (customerRes: ResponseDate) => {
        console.log('Customer data received:', customerRes);
        this.isLoading = false;

        // Check if the response contains a list of customers
        if (Array.isArray(customerRes.data) && customerRes.data.length > 0) {
          // Multiple customers returned - show selection dialog
          this.showCustomerSelectionDialog(customerRes.data, code);

        } else {
          // Single customer returned - proceed with check-in
          this.swalService.error('We couldn’t find the customer ID. Please check with the trainer.');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
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
  showCustomerSelectionDialog(customers: any[], code: string) {
    this.tempCustomers = customers;

    // Check for exact match on existingCustomerId (using loose equality as code is a string)
    const exactMatch = customers.find(c => c.existingCustomerId == code);

    if (exactMatch) {
      const name = exactMatch.firstName || exactMatch.lastName ?
        `${exactMatch.firstName || ''} ${exactMatch.lastName || ''}`.trim() :
        exactMatch.email || exactMatch.contactNumber || `Customer #${exactMatch.id}`;

      // Check for profile image
      const hasImages = exactMatch.documentDto?.attachments && Array.isArray(exactMatch.documentDto.attachments) && exactMatch.documentDto.attachments.length > 0;
      const firstImage = hasImages ? exactMatch.documentDto.attachments.find((att: any) => att.contentType?.startsWith('image/')) : null;
      const imageUrl = firstImage?.url || null;

      // Expiry and Balance Due logic
      let statusBadgesHtml = '';
      if (exactMatch.endDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(exactMatch.endDate);
        end.setHours(0, 0, 0, 0);
        const diffMs = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          statusBadgesHtml += `<span style="display:inline-flex; align-items:center; gap:4px; background:#e8f5e9; color:#2e7d32; border:1px solid #a5d6a7; border-radius:20px; padding:3px 10px; font-size:1em; font-weight:600;">📅 ${diffDays} day${diffDays !== 1 ? 's' : ''} left</span>`;
        } else if (diffDays === 0) {
          statusBadgesHtml += `<span style="display:inline-flex; align-items:center; gap:4px; background:#fff3e0; color:#e65100; border:1px solid #ffcc80; border-radius:20px; padding:3px 10px; font-size:2em; font-weight:600;">⚠️ Expires today</span>`;
        } else {
          statusBadgesHtml += `<span style="display:inline-flex; align-items:center; gap:4px; background:#ffebee; color:#c62828; border:1px solid #ef9a9a; border-radius:20px; padding:3px 10px; font-size:1em; font-weight:600;">❌ Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago</span>`;
        }
      } else {
        statusBadgesHtml = `<span style="display:inline-flex; align-items:center; gap:4px; background:#fff5f5; color:#e53e3e; border:1px solid #feb2b2; border-radius:20px; padding:4px 12px; font-size:1.1em; font-weight:600;">🚫 No Active Membership</span>`;
      }

      const balanceDueHtml = (exactMatch.balanceDue && exactMatch.balanceDue > 0)
        ? `<span style="display:inline-flex; align-items:center; gap:4px; background:#fff8e1; color:#f57f17; border:1px solid #ffe082; border-radius:20px; padding:3px 10px; font-size:1em; font-weight:600;">💰 Due: ₹${exactMatch.balanceDue.toFixed(2)}</span>`
        : '';

      Swal.fire({
        title: 'Is this you?',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
            ${imageUrl ? `
              <img src="${imageUrl}" alt="${name}" style="width: 240px; height: 240px; object-fit: cover; border-radius: 5%; border: 2px solid #a684ff; box-shadow: 0 4px 15px rgba(166, 132, 255, 0.3);" />
            ` : `
              <div style="width: 140px; height: 140px; background-color: #f0f0f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 4px solid #eee;">
                <span style="font-size: 4em; color: #999;">👤</span>
              </div>
            `}
            <div style="text-align: center;">
              <div style="font-size: 1.5em; font-weight: 700; color: #333; margin-bottom: 5px;">${name}</div>
              <div style="font-size: 1em; color: #666; margin-bottom: 8px;">ID: ${exactMatch.existingCustomerId}</div>
              ${exactMatch.membershipName ? `<div style="margin-bottom: 12px; padding: 6px 16px; background: #f3f0ff; color: #7c3aed; border-radius: 20px; font-weight: 600; display: inline-block;">🏋️ ${exactMatch.membershipName}</div>` : ''}
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                ${statusBadgesHtml}
                ${balanceDueHtml}
              </div>
              <div style="text-align: left;font-size: 1.1rem;color: #0b002d;margin-top: 16px;">
                ${exactMatch.email ? `<div>Email: ${this.maskEmail(exactMatch.email)}</div>` : ''}
                ${exactMatch.contactNumber ? `<div>Phone: ${this.maskPhone(exactMatch.contactNumber)}</div>` : ''}
              </div>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: exactMatch.isCheckIn == false || exactMatch.isCheckIn == null ? 'Check In' : 'Check Out',
        cancelButtonText: 'No, Not Me',
        confirmButtonColor: '#a684ff',
        cancelButtonColor: '#ff4d4f',
        reverseButtons: true,
        background: '#fff',
        timer: 10000,
        timerProgressBar: true,
        width: '450px'
      }).then((result) => {
        if (result.isConfirmed) {
          this.proceedWithCheckIn(exactMatch.id);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.renderCustomerSelectionList(customers);
        }
      });
    } else {
      this.renderCustomerSelectionList(customers);
    }
  }

  renderCustomerSelectionList(customers: any[]) {
    // Create HTML for customer selection
    let customerListHtml = '<div class="customer-selection-list" style="text-align: left;">';

    customers.forEach((customer, index) => {
      const name = customer.firstName || customer.lastName ?
        `${customer.firstName || ''} ${customer.lastName || ''}`.trim() :
        customer.email || customer.contactNumber || `Customer #${customer.id}`;

      // Check if customer has image attachments in documentDto
      const hasImages = customer.documentDto?.attachments && Array.isArray(customer.documentDto.attachments) && customer.documentDto.attachments.length > 0;
      const firstImage = hasImages ? customer.documentDto.attachments.find((att: any) => att.contentType?.startsWith('image/')) : null;
      const imageUrl = firstImage?.url || null;

      // Remaining membership days
      let remainingDaysHtml = '';
      if (customer.endDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(customer.endDate);
        end.setHours(0, 0, 0, 0);
        const diffMs = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          remainingDaysHtml = `<span style="display:inline-flex; align-items:center; gap:4px; background:#e8f5e9; color:#2e7d32; border:1px solid #a5d6a7; border-radius:20px; padding:3px 10px; font-size:0.82em; font-weight:600;">
            📅 ${diffDays} day${diffDays !== 1 ? 's' : ''} left
          </span>`;
        } else if (diffDays === 0) {
          remainingDaysHtml = `<span style="display:inline-flex; align-items:center; gap:4px; background:#fff3e0; color:#e65100; border:1px solid #ffcc80; border-radius:20px; padding:3px 10px; font-size:0.82em; font-weight:600;">
            ⚠️ Expires today
          </span>`;
        } else {
          remainingDaysHtml = `<span style="display:inline-flex; align-items:center; gap:4px; background:#ffebee; color:#c62828; border:1px solid #ef9a9a; border-radius:20px; padding:3px 10px; font-size:0.82em; font-weight:600;">
            ❌ Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago
          </span>`;
        }
      } else {
        remainingDaysHtml = `<span style="display:inline-flex; align-items:center; gap:4px; background:#fff5f5; color:#e53e3e; border:1px solid #feb2b2; border-radius:20px; padding:3px 10px; font-size:0.82em; font-weight:600;">🚫 No Active Membership</span>`;
      }

      // Balance due badge
      const balanceDueHtml = (customer.balanceDue && customer.balanceDue > 0)
        ? `<span style="display:inline-flex; align-items:center; gap:4px; background:#fff8e1; color:#f57f17; border:1px solid #ffe082; border-radius:20px; padding:3px 10px; font-size:0.82em; font-weight:600;">
            💰 Due: ₹${customer.balanceDue.toFixed(2)}
          </span>`
        : '';

      customerListHtml += `
        <div class="customer-item" style="padding: 15px; margin: 8px 0; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; background-color: #f9f9f9; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
             onclick="selectCustomer(${index})">
          <div style="display: flex; align-items: center; gap: 15px;">
            ${imageUrl ? `
              <img src="${imageUrl}" alt="${name}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px; border: 2px solid #ddd; flex-shrink: 0;" />
            ` : `
              <div style="width: 120px; height: 120px; background-color: #e0e0e0; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="font-size: 3em; color: #999;">👤</span>
              </div>
            `}
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                  <strong style="color: #333; font-size: 1.2em;">${name}</strong>
                  <button
                     type="button"
                     tabindex="-1"
                    style="
                      background-color: #d4f8d4;
                      color: #2e7d32;
                      border: 1px solid #a5d6a7;
                      border-radius: 4px;
                      padding: 8px 16px;
                      cursor: pointer;
                      font-weight: 500;
                      flex-shrink: 0;
                      box-shadow: 0 4px 12px rgba(46, 125, 50, 0.25);
                    "
                  >
                    Select
                  </button>
              </div>
              <div style="font-size: 0.95em; color: #666; margin-top: 8px;">
                ${customer.membershipName ? `<div style="font-weight:600; color:#555; margin-bottom:6px;">🏋️ ${customer.membershipName}</div>` : ''}
                ${customer.email ? `<div>Email: ${this.maskEmail(customer.email)}</div>` : ''}
                ${customer.contactNumber ? `<div>Phone: ${this.maskPhone(customer.contactNumber)}</div>` : ''}
              </div>
              ${(remainingDaysHtml || balanceDueHtml) ? `
              <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">
                ${remainingDaysHtml}
                ${balanceDueHtml}
              </div>` : ''}
            </div>
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
      width: customers.length > 2 ? '900px' : '600px', // Wider if many matches
      timer: 30000,
      timerProgressBar: true,
    });
  }

  maskEmail(email: string) {
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

  loadAdvertisements() {
    this.shopService.getAdvertisementsForArea('CHECKIN_AREA').subscribe({
      next: (res: any) => {
        if (res && res.data && res.data.content) {
          this.playableItems = [];
          res.data.content.forEach((ad: any) => {
            // Check if ad is active (status is boolean true)
            // And check if ad is not expired (endDate is in the future)
            const isActive = ad.status === true;
            const isNotExpired = ad.endDate ? new Date(ad.endDate) > new Date() : true;

            if (isActive && isNotExpired && ad.documentDto && ad.documentDto.attachments) {
              this.playableItems.push(...ad.documentDto.attachments);
            }
          });
          if (this.playableItems.length > 0) {
            this.playCarousel();
          }
        }
      },
      error: (err) => console.error('Error loading ads', err)
    });
  }

  playCarousel() {
    if (!this.playableItems || this.playableItems.length === 0) return;

    if (this.carouselTimer) {
      clearTimeout(this.carouselTimer);
    }

    const currentItem = this.playableItems[this.currentAdIndex];
    // Check if it's a video based on contentType
    const isVideo = currentItem.contentType && currentItem.contentType.startsWith('video');

    if (!isVideo) {
      // Image - set timer for 10 seconds
      this.carouselTimer = setTimeout(() => {
        this.nextAd();
      }, 10000);
    }
    // If Video, the (ended) event in HTML will trigger nextAd()
    // However, we need to ensure the video starts playing. 
    // In Angular, when [src] changes, the video element updates. 
    // We can rely on 'autoplay' attribute in HTML.

    if (isVideo) {
      // Force change detection to ensure the video element exists in the DOM
      this.cdr.detectChanges();

      // Use setTimeout to allow the browser to process the DOM update
      setTimeout(() => {
        if (this.videoPlayer && this.videoPlayer.nativeElement) {
          const videoElement = this.videoPlayer.nativeElement;
          videoElement.muted = true; // Ensure muted is set
          videoElement.play().catch(error => {
            console.log('Video autoplay failed:', error);
            // If autoplay fails, we might want to skip to next ad or try again
            // For now, let's just log it. 
          });
        }
      });
    }
  }

  nextAd() {
    this.currentAdIndex = (this.currentAdIndex + 1) % this.playableItems.length;
    this.playCarousel();
  }

  onVideoEnded() {
    this.nextAd();
  }
}