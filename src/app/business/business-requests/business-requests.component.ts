import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ApprovalDialogComponent } from './approval-dialog/approval-dialog.component';
import { RequestDetailsDialogComponent } from './request-details-dialog/request-details-dialog.component';

interface BusinessRequest {
  id: number;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: Date;
}

@Component({
  selector: 'app-business-requests',
  templateUrl: './business-requests.component.html',
  styleUrls: ['./business-requests.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule
  ]
})
export class BusinessRequestsComponent {
  displayedColumns: string[] = ['id', 'businessName', 'ownerName', 'email', 'phone', 'businessType', 'status', 'submittedDate', 'actions'];
  
  requests: BusinessRequest[] = [
    {
      id: 1,
      businessName: 'Tech Store',
      ownerName: 'John Doe',
      email: 'john@techstore.com',
      phone: '123-456-7890',
      businessType: 'Retail Store',
      description: 'Electronics and gadgets store',
      status: 'pending',
      submittedDate: new Date('2024-03-15')
    },
    // Add more mock data as needed
  ];

  constructor(private dialog: MatDialog) {}

  approveRequest(request: BusinessRequest) {
    this.dialog.open(ApprovalDialogComponent, {
      width: '400px',
      data: request
    });
  }

  viewDetails(request: BusinessRequest) {
    this.dialog.open(RequestDetailsDialogComponent, {
      width: '600px',
      data: request
    });
  }

  rejectRequest(request: BusinessRequest) {
    // Implement rejection logic
    request.status = 'rejected';
  }
} 