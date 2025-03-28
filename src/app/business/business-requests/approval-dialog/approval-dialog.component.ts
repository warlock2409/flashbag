import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-approval-dialog',
  template: `
    <h2 mat-dialog-title>Approve Business Account</h2>
    <mat-dialog-content>
      <form [formGroup]="approvalForm" class="approval-form">
        <p>Set login credentials for {{data.businessName}}</p>
        
        <mat-form-field appearance="outline">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" [value]="data.email" readonly>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password">
          <mat-hint>Minimum 8 characters</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Confirm Password</mat-label>
          <input matInput type="password" formControlName="confirmPassword">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" 
              (click)="onApprove()"
              [disabled]="!approvalForm.valid">
        Approve & Create Account
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .approval-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 300px;
      padding: 16px 0;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class ApprovalDialogComponent {
  approvalForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ApprovalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.approvalForm = this.fb.group({
      username: [data.email],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onApprove() {
    if (this.approvalForm.valid) {
      this.dialogRef.close(this.approvalForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 