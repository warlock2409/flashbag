import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-gym-checkin-actions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gym-checkin-actions.component.html',
  styleUrl: './gym-checkin-actions.component.scss'
})
export class GymCheckinActionsComponent {
  avatar: string = 'BI';
  memberName: string = 'Gym Member';
  today: string = new Date().toDateString();
  weeklySessions: string = '3/5';
  weekProgressPercent: number = 60;
  membershipRemaining: string = 'sessions left';
  membershipEnd: string = 'Ends Sep 30';
  streak: string = '5 days';
  reward: string = 'Next reward in 2 days';

  attendance: any = {
    "2025-09-29": { checkInAt: null, checkOutAt: null },
    "2025-09-30": { checkInAt: null, checkOutAt: null },
    "2025-10-01": { checkInAt: "2025-10-01T12:54:34.461+00:00", checkOutAt: "2025-10-01T14:11:05.979+00:00" },
    "2025-10-02": { checkInAt: null, checkOutAt: null },
    "2025-10-03": { checkInAt: "2025-10-03T15:09:52.420+00:00", checkOutAt: null },
    "2025-10-04": { checkInAt: null, checkOutAt: null },
    "2025-10-05": { checkInAt: null, checkOutAt: null }
  };

  getAttendanceKeys() {
    return Object.keys(this.attendance);
  }

  getDayLabel(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
  }

  getDayNumber(dateStr: string) {
    return new Date(dateStr).getDate();
  }

  getStatus(dateStr: string) {
    const record = this.attendance[dateStr];
    if (record.checkInAt && record.checkOutAt) return 'present';
    if (record.checkInAt && !record.checkOutAt) return 'partial';
    return 'absent';
  }

  readonly data = inject<any>(MAT_DIALOG_DATA);
  constructor(private dialogRef: MatDialogRef<GymCheckinActionsComponent>) {
    this.attendance = this.data.weeklyAttendance;
  }

  ngAfterViewInit() {
    console.log(this.data);
    const frontSVG = document.getElementById('body-front'); // front SVG
    const backSVG = document.getElementById('body-back');   // back SVG

    if (this.data) {

    }



    const parts = ["chest"];
    parts.forEach(id => {
      const group = frontSVG?.querySelector(`#${id}`); // query inside the SVG
      if (group) {
        group.querySelectorAll('path').forEach(path => {
          path.setAttribute('fill', 'red');
        });
      }

      const groupBack = backSVG?.querySelector(`#${id}`); // query inside the SVG
      if (groupBack) {
        groupBack.querySelectorAll('path').forEach(path => {
          path.setAttribute('fill', 'red');
        });
      }
    });

    setTimeout(() => {
      this.closeDialog();
    }, 9000);
    this.firePoppers();
  }

  @Output() close = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();

  closeDialog() {
    this.dialogRef.close();
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
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });
  }

}
