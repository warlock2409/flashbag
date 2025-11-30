import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output, Renderer2 } from '@angular/core';
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

  attendance: any = {};
  parts: string[] = ["chest"];
  getAttendanceKeys() {
    return Object.keys(this.attendance || {});
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
    // Map the incoming data to component properties
    this.attendance = this.data.weeklyAttendance;

    // Set member name from customer data
    if (this.data.customerDTO) {
      this.memberName = this.data.customerDTO.firstName || 'Gym Member';
      if (this.data.customerDTO.lastName) {
        this.memberName += ' ' + this.data.customerDTO.lastName;
      }
    }

    // Set streak from data
    if (this.data.streak !== undefined) {
      this.streak = this.data.streak + ' days';
    }

    // Set membership info
    if (this.data.membershipPlanName) {
      this.membershipRemaining = this.data.membershipPlanName;
    }

    if (this.data.remainingDays !== undefined) {
      this.membershipEnd = `Ends in ${this.data.remainingDays} days`;
    }

    // Calculate weekly sessions
    if (this.data.weeklyAttendance) {
      const totalDays = Object.keys(this.data.weeklyAttendance).length;
      const attendedDays = Object.values(this.data.weeklyAttendance).filter(
        (day: any) => day.checkInAt
      ).length;
      this.weeklySessions = `${attendedDays}/${totalDays}`;
      this.weekProgressPercent = Math.round((attendedDays / totalDays) * 100);
    }
  }

  ngAfterViewInit() {
    console.log(this.data);
    // Use a more robust approach with multiple attempts to ensure SVG is ready
    this.highlightBodyParts();

    setTimeout(() => {
      this.closeDialog();
    }, 9000);
    this.firePoppers();
  }

  private highlightBodyParts(attempts: number = 0) {
    const dialogs = document.querySelectorAll('mat-dialog-container');
    const dialog = dialogs[dialogs.length - 1];   // ALWAYS use newest

    const frontSVG = dialog.querySelector('#body-front');
    const backSVG = dialog.querySelector('#body-back');

    const all = dialog.querySelectorAll('g#chest');
    console.log('Number of chest inside active dialog:', all.length);


    // Try up to 10 times with increasing delays to find SVG elements
    if (attempts >= 10) {
      console.log('Failed to highlight body parts after 10 attempts');
      return;
    }


    // Check if SVGs are available
    if (!frontSVG || !backSVG) {
      console.log(`SVGs not ready (attempt ${attempts + 1}), retrying...`);
      setTimeout(() => this.highlightBodyParts(attempts + 1), 150 * (attempts + 1));
      return;
    }

    // Process todoDto for body mapping if available
    const parts: string[] = [];
    if (this.data.todoDto && this.data.todoDto.taskDtoList) {
      this.data.todoDto.taskDtoList.forEach((task: any) => {
        // Use title field as per project specification, convert to lowercase for SVG matching
        if (task.title) {
          parts.push(task.title.toLowerCase());
        }
      });
    }

    // Log parts for debugging
    console.log('Parts to highlight:', parts);

    if (parts.length === 0) {
      console.log('No parts to highlight');
      return;
    }

    parts.forEach(id => {
      // Try to find the group element in the front SVG
      let group = frontSVG?.querySelector(`g[id="${id}"]`);
      // If not found, try direct ID selector
      if (!group) {
        group = frontSVG?.querySelector(`#${id}`);
      }

      if (group) {
        console.log(`Found front group for ${id}:`, group);
        // Add a class to highlight the element
        group.classList.add('highlighted-muscle');
        // Directly set the style.fill to override currentColor
        group.querySelectorAll('path').forEach(path => {
          (path as SVGElement).style.fill = '#ef4444'; // red-500 color
        });
      } else {
        console.log(`Could not find front group for ${id}`);
      }

      // Try to find the group element in the back SVG
      let groupBack = backSVG?.querySelector(`g[id="${id}"]`);
      // If not found, try direct ID selector
      if (!groupBack) {
        groupBack = backSVG?.querySelector(`#${id}`);
      }

      if (groupBack) {
        console.log(`Found back group for ${id}:`, groupBack);
        // Add a class to highlight the element
        groupBack.classList.add('highlighted-muscle');
        // Directly set the style.fill to override currentColor
        groupBack.querySelectorAll('path').forEach(path => {
          (path as SVGElement).style.fill = '#ef4444'; // red-500 color
        });
      } else {
        console.log(`Could not find back group for ${id}`);
      }
    });
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