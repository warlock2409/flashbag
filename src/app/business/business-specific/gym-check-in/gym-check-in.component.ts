import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
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
  styleUrl: './gym-check-in.component.scss'
})
export class GymCheckInComponent {

  private subscription!: Subscription;
  dialog = inject(MatDialog);
  shopService = inject(ShopService);
  highlightedPart = 'quads'

  text: string = 'Hello World';
  qrCodeDataUrl: string | null = null;

  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;
  constructor(private swalService: SweatAlertService, private ablyService: AblyService) {
  }

  ngOnInit() {
    this.subscription = this.ablyService.onMessage('gym-checkin').subscribe(msg => {
      console.log('GymCheckIn', msg.data);
      this.openCheckInDialog(msg.data);
    });
  }

  generateQRCode() {
    let shopCode = localStorage.getItem("shopCode");
    QRCode.toCanvas(this.qrCanvas.nativeElement, shopCode, { width: 400 })
      .catch((err: any) => console.error(err));
  }

  ngAfterViewInit(): void {
    this.generateQRCode();
  }


  muscleColors: { [key: string]: string } = {
    calves: 'gray',
    quads: 'gray',
    abdominals: 'gray',
    obliques: 'gray'
  };

  openCheckInDialog(checkinInfo: any) {
    let data = {
      "customerDTO": {
        "id": null,
        "firstName": "Rajaraman Sekar",
        "lastName": null,
        "email": "buzylifeapp@gmail.com",
        "contactNumber": "8531837909",
        "introduced": false,
        "active": false,
        "membershipName": null,
        "totalSpent": null,
        "expiry": null,
        "lastSpendDate": null
      },
      "streak": 1,
      "remainingDays": 111,
      "weeklyAttendance": {
        "2025-10-06": {
          "checkInAt": null,
          "checkOutAt": null
        },
        "2025-10-07": {
          "checkInAt": null,
          "checkOutAt": null
        },
        "2025-10-08": {
          "checkInAt": null,
          "checkOutAt": null
        },
        "2025-10-09": {
          "checkInAt": "2025-10-09T00:01:04.294+00:00",
          "checkOutAt": "2025-10-09T00:11:06.531+00:00"
        },
        "2025-10-10": {
          "checkInAt": null,
          "checkOutAt": null
        },
        "2025-10-11": {
          "checkInAt": null,
          "checkOutAt": null
        },
        "2025-10-12": {
          "checkInAt": null,
          "checkOutAt": null
        }
      },
      "membershipPlanName": "FitStart",
      "isCheckIn": false
    }
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
    console.log(code);
    this.shopService.PostMembershipCheckIn(code).subscribe({
      next: (res: ResponseDate) => {
        console.log(res);
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
