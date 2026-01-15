import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { ShopModel } from 'src/app/models/shop.model';

@Component({
  selector: 'app-holidays-config-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    NzButtonModule,
    NzCardModule
  ],
  template: `
    <div class="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center border-b border-gray-200 py-3 px-4">
          <h2 class="text-lg font-semibold text-gray-800 m-0">Holidays Configuration</h2>
          <button (click)="closeDialog()" class="text-gray-400 hover:text-red-500 cursor-pointer">
            <mat-icon style="color: lightcoral;">cancel</mat-icon>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6">
          <form [formGroup]="holidaysForm">
            <nz-card nzType="inner" nzTitle="Add Holidays">
              <div formArrayName="holidays" class="space-y-4">
                <div *ngFor="let holiday of holidays.controls; let i = index" [formGroupName]="i"
                  class="flex gap-2 items-end">
                  <mat-form-field class="flex-1">
                    <mat-label>Holiday Name</mat-label>
                    <input matInput formControlName="name" placeholder="e.g., Christmas Day">
                  </mat-form-field>
                  
                  <mat-form-field class="flex-1">
                    <mat-label>Date</mat-label>
                    <input matInput formControlName="date" type="date">
                  </mat-form-field>
                  
                  <button mat-icon-button (click)="removeHoliday(i)" color="warn">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
              
              <div class="mt-4">
                <button mat-stroked-button type="button" (click)="addHoliday()" class="flex items-center gap-1">
                  <mat-icon>add</mat-icon>
                  Add Holiday
                </button>
              </div>
            </nz-card>
            
            <div class="flex justify-end mt-6 gap-2">
              <button mat-stroked-button (click)="closeDialog()">Cancel</button>
              <button mat-flat-button color="primary" 
                [disabled]="holidaysForm.invalid"
                (click)="saveChanges()">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class HolidaysConfigDialogComponent {
  holidaysForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<HolidaysConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { shop: ShopModel }
  ) {
    this.holidaysForm = this.fb.group({
      holidays: this.fb.array([])
    });
    
    // Initialize with some default holidays or existing data
    this.addHoliday(); // Add one empty holiday row by default
  }

  get holidays(): FormArray {
    return this.holidaysForm.get('holidays') as FormArray;
  }

  addHoliday() {
    this.holidays.push(this.fb.group({
      name: ['', Validators.required],
      date: ['', Validators.required]
    }));
  }

  removeHoliday(index: number) {
    this.holidays.removeAt(index);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  saveChanges() {
    if (this.holidaysForm.valid) {
      this.dialogRef.close(this.holidaysForm.value.holidays);
    }
  }
}