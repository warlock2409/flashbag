import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-gym-checkin-actions',
  standalone: true,
  imports: [],
  templateUrl: './gym-checkin-actions.component.html',
  styleUrl: './gym-checkin-actions.component.scss'
})
export class GymCheckinActionsComponent {
  avatar: string = 'JS';
  memberName: string = 'John Smith';
  today: string = new Date().toDateString();
  weeklySessions: string = '3/5';
  weekProgressPercent: number = 60;
  membershipRemaining: string = '2 sessions left';
  membershipEnd: string = 'Ends Sep 30';
  streak: string = '5 days';
  reward: string = 'Next reward in 2 days';

  constructor(private dialogRef: MatDialogRef<GymCheckinActionsComponent>) {

  }

  ngAfterViewInit() {
    const parts = ['traps', 'calves', 'hamstrings', 'lowerback'];
    parts.forEach(id => {
      const group = document.getElementById(id);
      if (group) {
        const paths = group.querySelectorAll('path'); // select paths inside the group
        paths.forEach(path => {
          path.setAttribute('fill', 'red'); // change fill of each path
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
