import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { ShopModel } from 'src/app/models/shop.model';

@Component({
  selector: 'app-business-hours-config-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    NzButtonModule,
    NzCardModule
  ],
  template: `
    <div class="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center border-b border-gray-200 py-3 px-4">
          <h2 class="text-lg font-semibold text-gray-800 m-0">Business Hours</h2>
          <button (click)="closeDialog()" class="text-gray-400 hover:text-red-500 cursor-pointer">
            <mat-icon style="color: lightcoral;">cancel</mat-icon>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6">
          <form [formGroup]="hoursForm">
            <div formArrayName="days" class="space-y-4">
              <div *ngFor="let day of days.controls; let i = index" [formGroupName]="i">
                <nz-card nzType="inner">
                  <div class="flex items-center justify-between">
                    <mat-checkbox formControlName="enabled">
                      {{ getDayName(i) }}
                    </mat-checkbox>
                    
                    <div class="flex gap-2" *ngIf="day.get('enabled')?.value">
                      <button mat-stroked-button type="button" (click)="addSession(i)" 
                        class="text-xs">
                        <mat-icon>add</mat-icon>
                        Add Session
                      </button>
                      <button mat-stroked-button type="button" (click)="copyToAll(i)"
                        class="text-xs">
                        <mat-icon>content_copy</mat-icon>
                        Copy to All
                      </button>
                    </div>
                  </div>
                  
                  <div *ngIf="day.get('enabled')?.value" class="mt-4 ml-8">
                    <div formArrayName="sessions" class="space-y-2">
                      <div *ngFor="let session of getSessions(i).controls; let j = index" 
                        [formGroupName]="j" class="flex gap-2 items-center">
                        <input type="time" formControlName="start" class="border rounded p-2">
                        <span>to</span>
                        <input type="time" formControlName="end" class="border rounded p-2">
                        <button mat-icon-button (click)="removeSession(i, j)" color="warn">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                </nz-card>
              </div>
            </div>
            
            <div class="flex justify-end mt-6 gap-2">
              <button mat-stroked-button (click)="closeDialog()">Cancel</button>
              <button mat-flat-button color="primary" (click)="saveChanges()">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class BusinessHoursConfigDialogComponent {
  hoursForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BusinessHoursConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { shop: ShopModel }
  ) {
    this.hoursForm = this.fb.group({
      days: this.fb.array([])
    });
    
    this.initializeDays();
    const shopData: any = data.shop;
    if (shopData?.shopHoursDtos) {
      this.populateExistingHours(shopData.shopHoursDtos);
    }
  }

  initializeDays() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const daysArray = this.hoursForm.get('days') as FormArray;
    
    days.forEach(day => {
      daysArray.push(this.fb.group({
        day: [day],
        enabled: [false],
        sessions: this.fb.array([])
      }));
    });
  }

  populateExistingHours(hoursData: any[]) {
    const daysArray = this.hoursForm.get('days') as FormArray;
    
    hoursData.forEach(hour => {
      const dayIndex = this.getDayIndex(hour.day);
      if (dayIndex !== -1) {
        const dayGroup = daysArray.at(dayIndex) as FormGroup;
        dayGroup.patchValue({ enabled: hour.enabled });
        
        if (hour.sessions && hour.sessions.length > 0) {
          const sessionsArray = dayGroup.get('sessions') as FormArray;
          hour.sessions.forEach((session: any) => {
            sessionsArray.push(this.fb.group({
              start: [this.formatTime(session.start)],
              end: [this.formatTime(session.end)]
            }));
          });
        }
      }
    });
  }

  getDayIndex(dayName: string): number {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.indexOf(dayName.toLowerCase());
  }

  getDayName(index: number): string {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[index];
  }

  get days(): FormArray {
    return this.hoursForm.get('days') as FormArray;
  }

  getSessions(dayIndex: number): FormArray {
    return this.days.at(dayIndex).get('sessions') as FormArray;
  }

  addSession(dayIndex: number) {
    const sessions = this.getSessions(dayIndex);
    sessions.push(this.fb.group({
      start: ['09:00'],
      end: ['17:00']
    }));
  }

  removeSession(dayIndex: number, sessionIndex: number) {
    this.getSessions(dayIndex).removeAt(sessionIndex);
  }

  copyToAll(sourceIndex: number) {
    const sourceDay = this.days.at(sourceIndex) as FormGroup;
    const sourceSessions = sourceDay.get('sessions') as FormArray;
    
    if (!sourceDay.get('enabled')?.value || sourceSessions.length === 0) {
      return;
    }
    
    for (let i = 0; i < this.days.length; i++) {
      if (i === sourceIndex) continue;
      
      const targetDay = this.days.at(i) as FormGroup;
      const targetSessions = targetDay.get('sessions') as FormArray;
      
      targetDay.get('enabled')?.setValue(true);
      targetSessions.clear();
      
      sourceSessions.controls.forEach(sessionCtrl => {
        const sessionValue = sessionCtrl.value;
        targetSessions.push(this.fb.group({
          start: [sessionValue.start],
          end: [sessionValue.end]
        }));
      });
    }
  }

  formatTime(dateTimeString: string): string {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  saveChanges() {
    const formData = this.hoursForm.value;
    this.dialogRef.close(formData.days);
  }
}