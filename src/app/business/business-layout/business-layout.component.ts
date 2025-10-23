import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { AblyService } from 'src/app/services/ably.service';
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

  constructor(private cdr: ChangeDetectorRef, private ablyService: AblyService, private notification: SweatAlertService, private timeZoneHelper: TimeZoneHelperService) {
    console.log("Layout Component");

  }

  ngOnInit() {
    // Watch for shop changes
    this.ablyService.shopCode$.subscribe(async (shopCode) => {

      if (!shopCode) return;

      await this.ablyService.unsubscribe(shopCode);
      console.log(`Subscribe to ${shopCode}`);
      
      await this.ablyService.subscribe(shopCode, (msg) => {
        let data = JSON.parse(msg.data)
        this.playNotificationSound();
        console.log(data);
        if (msg.name === 'WaitList') {
          this.notification.createNotification("success", "Trail Request", `Trail For ${data.serviceName} on ${this.timeZoneHelper.toTimeZoneSpecific(undefined, data.requestedDate)}`);
          this.ablyService.sendMessage('home', data);
        } else if (msg.name == 'GymCheckIn') {
          this.ablyService.sendMessage('gym-checkin', data);
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
  }

  ngOnDestroy() {
    console.log("ngOnDestroy Layout");

  }


}


