import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, ViewChild, OnDestroy, NgZone, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import QRCode from 'qrcode';
import { GymCheckinActionsComponent } from './gym-checkin-actions/gym-checkin-actions.component';
import { MatIconModule } from '@angular/material/icon';
import { ShopService } from 'src/app/services/shop.service';
import { ResponseDate } from 'src/app/app.component';
import { SweatAlertService } from 'src/app/services/sweat-alert.service';
import { AblyService } from 'src/app/services/ably.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gym-check-in',
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule],
  templateUrl: './gym-check-in.component.html',
  styleUrls: ['./gym-check-in.component.scss'] // Added SCSS file reference
})
export class GymCheckInComponent implements OnInit, AfterViewInit, OnDestroy {

  private subscription!: Subscription;
  dialog = inject(MatDialog);
  shopService = inject(ShopService);
  highlightedPart = 'quads'

  text: string = 'Hello World';
  qrCodeDataUrl: string | null = null;

  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;
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
    if (this.subscription) {
      this.subscription.unsubscribe();
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
        console.log('Initializing Ably service');
        this.ablyService.initialize("Ek4x8A.f1K1KA:QOg5QxJ5pCLKTD7MAbgHej3gaUhr07MXxLb6XzKiAu4");
        
        // Set the shop code to trigger the business layout component's subscription
        // This will cause the business layout component to set up the channel subscription
        console.log('Setting shop code in Ably service');
        this.ablyService.setShopCode(shopCode);
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
      // Subscribe to gym-checkin messages
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

  generateQRCode() {
    let shopCode = localStorage.getItem("shopCode");
    console.log('Generating QR code for shop code:', shopCode);
    
    // Use larger size for desktop screens
    const isLargeScreen = window.innerWidth >= 1024;
    const qrSize = isLargeScreen ? 400 : 280;
    
    QRCode.toCanvas(this.qrCanvas.nativeElement, shopCode, { 
      width: qrSize,
      margin: 2
    })
      .catch((err: any) => console.error(err));
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
      this.typedText = ''; // clear after submit
    }
  }

  submitCheckIn(code: string) {
    // Restrict empty API calls - require at least 1 character
    if (!code || code.trim().length < 1) {
      console.log('Check-in code must be at least 1 character, skipping API call');
      return;
    }
    
    console.log('Submitting check-in with code:', code);
    this.shopService.PostMembershipCheckIn(code).subscribe({
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
    })
  }
}