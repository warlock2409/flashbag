import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { AblyService } from 'src/app/services/ably.service';
import { AuthService } from 'src/app/services/auth.service';
import { SweatAlertService } from 'src/app/services/sweat-alert.service';
import { TimeZoneHelperService } from 'src/app/services/timeZoneHelper';

@Component({
  selector: 'app-business-layout',
  templateUrl: './business-layout.component.html',
  styleUrls: ['./business-layout.component.scss'],
  standalone: false
})
export class BusinessLayoutComponent {
  isExpanded = false;
  currentShopCode = '';

  constructor(private router: Router,private cdr: ChangeDetectorRef, private ablyService: AblyService, private notification: SweatAlertService, private timeZoneHelper: TimeZoneHelperService, public authService: AuthService) {
  }

  async logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    localStorage.clear();
  }

  ngOnInit() {
    console.log("BusinessLayoutComponent ngOnInit");
    // Check if there's already a shop code set
    const initialShopCode = this.ablyService['shopCodeSubject'].getValue();
    console.log("Initial shop code from AblyService:", initialShopCode);
    
    // If there's no shop code in the AblyService but there is one in localStorage,
    // set it in the AblyService
    if (!initialShopCode) {
      const localStorageShopCode = localStorage.getItem("shopCode");
      console.log("Shop code from localStorage:", localStorageShopCode);
      if (localStorageShopCode) {
        console.log("Setting shop code from localStorage");
        // Initialize Ably service before setting shop code
        this.initializeAblyService();
        this.ablyService.setShopCode(localStorageShopCode);
      }
    } else {
      // If there's already a shop code, initialize Ably service and set up the subscription immediately
      console.log("Initializing Ably service and setting up subscription for initial shop code");
      this.initializeAblyService();
      this.setupChannelSubscription(initialShopCode);
    }
    
    // Watch for shop changes
    console.log("Subscribing to shopCode$ changes");
    this.ablyService.shopCode$.subscribe(async (shopCode) => {
      console.log("Shop code changed to:", shopCode);
      if (!shopCode) return;
      
      // Initialize Ably service before setting up subscription
      this.initializeAblyService();
      
      // Set up the channel subscription
      console.log("Setting up subscription for new shop code");
      await this.setupChannelSubscription(shopCode);
    });
  }

  /**
   * Initialize the Ably service if it hasn't been initialized yet
   */
  private initializeAblyService(): void {
    try {
      // Initialize the Ably service with the API key
      console.log('Initializing Ably service in BusinessLayoutComponent');
      this.ablyService.initialize("Ek4x8A.f1K1KA:QOg5QxJ5pCLKTD7MAbgHej3gaUhr07MXxLb6XzKiAu4");
    } catch (error) {
      console.error('Error initializing Ably service:', error);
    }
  }

  /**
   * Set up the channel subscription for a shop code
   */
  private async setupChannelSubscription(shopCode: string): Promise<void> {
    console.log("Setting up channel subscription for shop code:", shopCode);
    try {
      console.log(`Subscribing to ${shopCode}`);
      await this.ablyService.subscribe(shopCode, (msg) => {
        console.log("Received message on channel:", msg);
        let data = JSON.parse(msg.data)
        this.playNotificationSound();
        console.log("Parsed message data:", data);
        if (msg.name === 'WaitList') {
          this.notification.createNotification("success", "Trail Request", `Trail For ${data.serviceName} on ${this.timeZoneHelper.toTimeZoneSpecific(undefined, data.requestedDate)}`);
          this.ablyService.sendMessage('home', data);
        } else if (msg.name == 'GymCheckIn') {
          console.log("Forwarding GymCheckIn message to gym-checkin subscribers");
          this.ablyService.sendMessage('gym-checkin', data);
        }
      });
      console.log(`Successfully subscribed to ${shopCode}`);
    } catch (error) {
      console.error('Error setting up channel subscription:', error);
    }
  }

  playNotificationSound() {
    const audio = new Audio('assets/sounds/guitar-notification-alert.wav');
    audio.play().catch((err) => console.error('Sound play error:', err));
  }

  @ViewChild(MatSidenavContainer) sidenavContainer!: MatSidenavContainer;

  toggleSidenav() {
    this.isExpanded = !this.isExpanded;

    // Adjust layout margins after toggle
    setTimeout(() => {
      this.sidenavContainer.updateContentMargins();
    }, 0);
    this.notification.createNotification("success", "New Waitlist", "A new waitlist has been created.");
    console.log('Publishing to Ably');
  }
}