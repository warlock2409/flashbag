import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-business-request-dialog',
  templateUrl: './business-request-dialog.component.html',
  styleUrls: ['./business-request-dialog.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    CommonModule,
    MatDialogModule
  ]
})
export class BusinessRequestDialogComponent {
  requestForm: FormGroup;

  businessTypes = [
    'Retail Store',
    'Restaurant',
    'Service Provider',
    'Manufacturer',
    'Wholesaler',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BusinessRequestDialogComponent>
  ) {
    this.requestForm = this.fb.group({
      businessName: ['', Validators.required],
      ownerName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      businessType: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(50)]]
    });
  }

  onSubmit() {
    if (this.requestForm.valid) {
      this.dialogRef.close(this.requestForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 