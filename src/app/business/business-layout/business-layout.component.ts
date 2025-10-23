import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { AblyService } from 'src/app/services/ably.service';
import { SweatAlertService } from 'src/app/services/sweat-alert.service';

@Component({
  selector: 'app-business-layout',
  templateUrl: './business-layout.component.html',
  styleUrls: ['./business-layout.component.scss'],
  standalone: false
})
export class BusinessLayoutComponent {
  isExpanded = false;
  currentShopCode = '';

  constructor(private cdr: ChangeDetectorRef, private ablyService: AblyService, private notification: SweatAlertService) {

  }

  ngOnInit() {
    // Watch for shop changes
    this.ablyService.shopCode$.subscribe(async (shopCode) => {
      if (!shopCode) return;
      console.log('Shop Code Changed:', shopCode);

      await this.ablyService.subscribe(shopCode, (msg) => {
        console.log('Ably Event:', msg);
        this.playNotificationSound();
        if (msg.name === 'waitlistCreated') {
          // update UI or show toast
        }
      });
    });
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


