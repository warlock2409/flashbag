import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-phone-update-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <div class="phone-update-container p-5 sm:p-8 bg-[#1e293b] text-slate-100 rounded-2xl shadow-2xl ring-1 ring-white/10 w-full mx-auto">
      <h2 class="text-xl sm:text-2xl font-semibold tracking-tight mb-2 !text-white">Complete Profile</h2>
      <p class="text-slate-400 text-xs sm:text-sm mb-6 sm:mb-8">Almost there! We just need a few more details to set up your account.</p>
      
      <form [formGroup]="phoneForm" (ngSubmit)="onSubmit()" class="space-y-4 sm:space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-[11px] sm:text-xs font-medium !text-slate-400 px-1">First Name</label>
            <input 
              formControlName="firstName" 
              class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 sm:py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
              placeholder="Enter first name"
            >
            <div class="h-4">
              <span class="text-[10px] !text-rose-400 px-1" *ngIf="phoneForm.get('firstName')?.touched && phoneForm.get('firstName')?.invalid">
                First name is required
              </span>
            </div>
          </div>

          <div class="space-y-1.5 flex-1">
            <label class="text-[11px] sm:text-xs font-medium !text-slate-400 px-1">Last Name</label>
            <input 
              formControlName="lastName" 
              class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 sm:py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
              placeholder="Enter last name"
            >
            <div class="h-4">
              <span class="text-[10px] text-rose-400 px-1" *ngIf="phoneForm.get('lastName')?.touched && phoneForm.get('lastName')?.invalid">
                Last name is required
              </span>
            </div>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-[11px] sm:text-xs font-medium !text-slate-400 px-1">Phone Number</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">+91</span>
            <input 
              formControlName="phone" 
              type="tel"
              class="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-2 sm:py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
              placeholder="9876543210"
            >
          </div>
          <div class="h-4">
            <span class="text-[10px] text-rose-400 px-1" *ngIf="phoneForm.get('phone')?.touched && phoneForm.get('phone')?.invalid">
              {{ phoneForm.get('phone')?.hasError('required') ? 'Phone number is required' : 'Enter a valid 10-digit Indian number' }}
            </span>
          </div>
        </div>

        <div class="flex justify-end items-center gap-4 pt-2 sm:pt-4">
          <button 
            type="submit" 
            mat-raised-button 
            class="w-full sm:w-auto !bg-violet-600 !text-white !rounded-xl !px-8 !py-6 !font-semibold !shadow-lg hover:!bg-violet-500 disabled:!bg-slate-700 disabled:!text-slate-500"
            [disabled]="phoneForm.invalid"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .phone-update-container {
      max-width: 450px;
    }
  `]
})
export class PhoneUpdateDialogComponent {
  phoneForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PhoneUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string }
  ) {
    this.phoneForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      email: [data.email]
    });
  }

  onSubmit() {
    if (this.phoneForm.valid) {
      this.dialogRef.close(this.phoneForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
