import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request-details-dialog',
  template: `
    <h2 mat-dialog-title>Business Request Details</h2>
    <mat-dialog-content>
      <div class="details">
        <p><strong>Business Name:</strong> {{data.businessName}}</p>
        <p><strong>Owner:</strong> {{data.ownerName}}</p>
        <p><strong>Email:</strong> {{data.email}}</p>
        <p><strong>Phone:</strong> {{data.phone}}</p>
        <p><strong>Type:</strong> {{data.businessType}}</p>
        <p><strong>Description:</strong> {{data.description}}</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .details { padding: 16px; }
    p { margin: 8px 0; }
  `],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule]
})
export class RequestDetailsDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<RequestDetailsDialogComponent>
  ) {}

  close() {
    this.dialogRef.close();
  }
} 