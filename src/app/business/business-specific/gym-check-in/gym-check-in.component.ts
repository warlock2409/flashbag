import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import QRCode from 'qrcode';
import { GymCheckinActionsComponent } from './gym-checkin-actions/gym-checkin-actions.component';
import { MatIconModule } from '@angular/material/icon';
import { ShopService } from 'src/app/services/shop.service';
import { ResponseDate } from 'src/app/app.component';

@Component({
  selector: 'app-gym-check-in',
  standalone: true,
  imports: [FormsModule, CommonModule,MatIconModule],
  templateUrl: './gym-check-in.component.html',
  styleUrl: './gym-check-in.component.scss'
})
export class GymCheckInComponent {
  dialog = inject(MatDialog);
  shopService = inject(ShopService);
  highlightedPart = 'quads'

  text: string = 'Hello World';
  qrCodeDataUrl: string | null = null;

  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;
  constructor() {

  }

  generateQRCode() {
    QRCode.toCanvas(this.qrCanvas.nativeElement, 'Hello World', { width: 400 })
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

  openCheckInDialog() {
    const dialogRef = this.dialog.open(GymCheckinActionsComponent, {
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

  submitCheckIn(code:string){
    console.log(code);
    this.shopService.PostMembershipCheckIn(code).subscribe({
      next:(res:ResponseDate)=>{
        console.log(res);
        this.openCheckInDialog();
      },
      error:(err:any)=>{

      }
    })
  }



}
