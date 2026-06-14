import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-trial-date-picker-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatDatepickerModule,
    MatCardModule,
    MatButtonModule
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <div class="bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 w-full max-w-[400px]">
      <div class="p-4 border-b border-white/5">
        <h2 class="text-lg font-semibold !text-white">Select Trial Date</h2>
      </div>
      
      <div class="p-4 flex justify-center min-h-[360px]">
        <mat-card class="!bg-transparent !shadow-none !border-none w-full">
          <mat-calendar 
            [minDate]="minDate" 
            [(selected)]="selectedDate"
            (selectedChange)="onDateSelected($event)">
          </mat-calendar>
        </mat-card>
      </div>

      <div class="p-4 bg-white/5 flex justify-end gap-3">
        <button mat-button (click)="onCancel()" class="!text-slate-400">Cancel</button>
        <button 
          mat-raised-button 
          [disabled]="!selectedDate"
          (click)="onConfirm()"
          class="!bg-violet-600 !text-white !rounded-lg !px-6">
          Confirm
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .mat-calendar {
      width: 100% !important;
      height: auto !important;
    }
    :host ::ng-deep .mat-calendar-body-label,
    :host ::ng-deep .mat-calendar-period-button,
    :host ::ng-deep .mat-calendar-table-header,
    :host ::ng-deep .mat-calendar-body-cell-content {
      color: #f1f5f9 !important;
    }
    :host ::ng-deep .mat-calendar-next-button,
    :host ::ng-deep .mat-calendar-previous-button {
      color: #94a3b8 !important;
    }
    :host ::ng-deep .mat-calendar-body-selected {
      background-color: #7c3aed !important;
      color: white !important;
    }
    :host ::ng-deep .mat-calendar-body-today:not(.mat-calendar-body-selected) {
      border-color: #7c3aed !important;
    }
  `]
})
export class TrialDatePickerDialogComponent {
  selectedDate: Date | null = null;
  minDate = new Date();

  constructor(private dialogRef: MatDialogRef<TrialDatePickerDialogComponent>) {}

  onDateSelected(date: Date | null) {
    this.selectedDate = date;
  }

  onConfirm() {
    if (this.selectedDate) {
      this.dialogRef.close(this.selectedDate);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
