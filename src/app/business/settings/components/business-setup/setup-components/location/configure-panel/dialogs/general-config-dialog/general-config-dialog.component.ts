import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule as NzInput } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ShopModel } from 'src/app/models/shop.model';

@Component({
  selector: 'app-general-config-dialog',
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
    MatTooltipModule,
    NzButtonModule,
    NzCardModule,
    NzInput,
    NzSelectModule
  ],
  template: `
    <div class="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center border-b border-gray-200 py-3 px-4">
          <h2 class="text-lg font-semibold text-gray-800 m-0">General Settings</h2>
          <button (click)="closeDialog()" class="text-gray-400 hover:text-red-500 cursor-pointer">
            <mat-icon style="color: lightcoral;">cancel</mat-icon>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6">
          <form [formGroup]="generalForm">
            <nz-card nzType="inner" nzTitle="Shop Information">
              <div class="space-y-4">
                <mat-form-field class="w-full">
                  <mat-label>Shop Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter shop name">
                </mat-form-field>
                
                <mat-form-field class="w-full">
                  <mat-label>Email</mat-label>
                  <input matInput formControlName="email" type="email" placeholder="Enter email address">
                </mat-form-field>
                
                <mat-form-field class="w-full">
                  <mat-label>Phone Number</mat-label>
                  <input matInput formControlName="phone" placeholder="Enter phone number">
                </mat-form-field>
              </div>
            </nz-card>
            
            <div class="flex justify-end mt-6 gap-2">
              <button mat-stroked-button (click)="closeDialog()">Cancel</button>
              <button mat-flat-button color="primary" 
                [disabled]="generalForm.invalid"
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
export class GeneralConfigDialogComponent {
  generalForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<GeneralConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { shop: ShopModel }
  ) {
    this.generalForm = this.fb.group({
      name: [data.shop?.name || '', Validators.required],
      email: [data.shop?.email || '', [Validators.required, Validators.email]],
      phone: [data.shop?.contactNumber || '', Validators.required]
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  saveChanges() {
    if (this.generalForm.valid) {
      this.dialogRef.close(this.generalForm.value);
    }
  }
}