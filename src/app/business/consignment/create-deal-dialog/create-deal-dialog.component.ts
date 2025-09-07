import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-deal-dialog',
  templateUrl: './create-deal-dialog.component.html',
  styles: [`
    :host {
      display: block;
      padding: 16px;
    }

    h2 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }

    .deal-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px 0;
    }

    mat-form-field {
      width: 100%;
    }

    mat-dialog-content {
      padding-top: 20px;
      max-height: 70vh;
    }

    mat-dialog-actions {
      padding: 16px 0;
      margin-bottom: 0;
    }

    textarea {
      min-height: 100px;
    }

    .mat-mdc-dialog-content {
      max-height: 70vh;
      padding: 0;
    }

    button {
      min-width: 100px;
    }
  `],
  standalone:false
})
export class CreateDealDialogComponent {
  dealForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateDealDialogComponent>
  ) {
    this.dealForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      location: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.dealForm.valid) {
      this.dialogRef.close(this.dealForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 