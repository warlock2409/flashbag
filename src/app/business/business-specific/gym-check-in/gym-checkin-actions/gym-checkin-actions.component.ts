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
  workoutDuration: string = '0h 0m 0s';
  avatar: string = 'BI';
  memberName: string = 'Gym Member';
  today: string = new Date().toDateString();
  weeklySessions: string = '3/5';
  weekProgressPercent: number = 60;
  membershipRemaining: string = 'sessions left';
  membershipEnd: string = 'Ends Sep 30';
  streak: string = '5 days';
  reward: string = 'Next reward in 2 days';
  customerChallengeDtos: any[] = [];

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
    this.getTodayWorkDuration(this.data.weeklyAttendance);

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
    console.log(this.data.customerChallengeDtos, "customerChallengeDtos");
    if (this.data.customerChallengeDtos) {
      this.customerChallengeDtos = this.data.customerChallengeDtos;
    }
  }

  get attendanceMilestones() {
    return [...this.customerChallengeDtos]
      .filter(c => c.conditionType === 'ATTENDANCE')
      .sort((a, b) => a.targetValue - b.targetValue);
  }

  get purchaseMilestones() {
    return this.customerChallengeDtos.filter(c => c.conditionType === 'PURCHASE_AMOUNT');
  }

  get nextAttendanceMilestone() {
    return this.attendanceMilestones.find(m => !m.completed);
  }

  get sessionsToNextReward() {
    // Find the first milestone that is neither completed nor expired
    const nextValid = this.attendanceMilestones.find(m => !m.completed && m.status !== 'EXPIRED');
    if (!nextValid) return null;

    // Use current value from the first incomplete milestone to get the most recent total sessions
    const currentTotal = this.attendanceMilestones.find(m => !m.completed)?.currentValue || 0;

    return Math.max(0, nextValid.targetValue - currentTotal);
  }

  get visibleAttendanceMilestones() {
    const milestones = this.attendanceMilestones;
    if (milestones.length === 0) return [];

    // Find the current active milestone (the first one not completed)
    const currentIndex = milestones.findIndex(m => !m.completed);

    // Handle case where all are completed
    if (currentIndex === -1) {
      return milestones.slice(Math.max(0, milestones.length - 5));
    }

    // Target window: [idx-2, idx-1, idx (current), idx+1, idx+2]
    const start = Math.max(0, currentIndex - 2);
    const end = Math.min(milestones.length, currentIndex + 3);

    return milestones.slice(start, end);
  }

  getVisibleNodePosition(milestone: any) {
    const visible = this.visibleAttendanceMilestones;
    if (visible.length === 0) return 0;
    if (visible.length === 1) return 50;

    const idx = visible.findIndex(m => m.targetValue === milestone.targetValue);
    if (idx === -1) return 0;

    // Space nodes between 10% and 90% to allow progress to be visible at both ends
    return 10 + (idx / (visible.length - 1)) * 80;
  }

  get totalAttendanceProgress() {
    const visible = this.visibleAttendanceMilestones;
    const all = this.attendanceMilestones;
    
    if (visible.length === 0 || all.length === 0) return 0;

    const currentIndex = visible.findIndex(m => !m.completed);

    // Use current value from the milestone we are actually working towards (currNode),
    // as completed milestones might have their currentValue capped at their targetValue.
    const currentTotal = currentIndex !== -1 ? visible[currentIndex].currentValue : (all[all.length - 1]?.currentValue || 0);

    // If all visible are completed, fill to 100% (or at least past the last node)
    if (currentIndex === -1) return 100;

    // Layout constants (must match getVisibleNodePosition)
    const padding = 10; 
    const availableWidth = 80;

    const currNode = visible[currentIndex];
    const currNodePos = padding + (currentIndex / (visible.length - 1)) * availableWidth;

    if (currentIndex === 0) {
      // Progress towards the first visible milestone
      // Check if there is a previous milestone globally
      const globalIdx = all.findIndex(m => m.targetValue === currNode.targetValue);
      
      if (globalIdx === 0) {
        // Progress from 0 sessions to the first milestone (10% position)
        const progress = Math.min(1, Math.max(0, currentTotal / currNode.targetValue));
        return progress * padding; // Fills from 0 to 10%
      } else {
        // Progress from a hidden previous milestone to the first visible one
        const prevGlobal = all[globalIdx - 1];
        const range = currNode.targetValue - prevGlobal.targetValue;
        if (range <= 0) return 0;
        
        const progress = Math.min(1, Math.max(0, (currentTotal - prevGlobal.targetValue) / range));
        return progress * padding; // This is a bit simplified, but ensures we show progress entering the window
      }
    }

    const prevNode = visible[currentIndex - 1];
    const prevNodePos = padding + ((currentIndex - 1) / (visible.length - 1)) * availableWidth;
    
    const segmentWidth = currNodePos - prevNodePos;
    const targetDiff = currNode.targetValue - prevNode.targetValue;
    
    if (targetDiff <= 0) return prevNodePos;

    const progressInSegment = (currentTotal - prevNode.targetValue) / targetDiff;
    const clampedProgress = Math.min(1, Math.max(0, progressInSegment));

    return prevNodePos + (clampedProgress * segmentWidth);
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
          parts.push(task.title.toLowerCase().replace(/\s+/g, "_"));
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

  getTodayWorkDuration(data: any) {
    const today = new Date().toLocaleDateString('en-CA');
    const entry = data[today];

    if (!entry?.checkInAt || !entry?.checkOutAt) return null;

    const checkIn = new Date(entry.checkInAt);
    const checkOut = new Date(entry.checkOutAt);

    const diffMs = checkOut.getTime() - checkIn.getTime();

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    console.log(`${diffHours}h ${diffMinutes % 60}m ${diffSeconds % 60}s`);
    this.workoutDuration = `${diffHours}h ${diffMinutes % 60}m ${diffSeconds % 60}s`;
    return this.workoutDuration;
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