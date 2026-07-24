import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { FollowUp } from 'src/app/models/retention.model';

@Component({
  selector: 'app-customer-followups-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="chat-wrapper flex flex-col h-full">
      <!-- Header -->
      <div class="chat-header flex items-center gap-4 px-4 py-3 bg-violet-400 text-white">
        <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold uppercase">
          {{ (customerName || '?').charAt(0) }}
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="!m-0 !text-base truncate">{{ customerName | titlecase }}</h4>
          <p class="!m-0 text-xs text-white/80">Follow-up history</p>
        </div>
        <button (click)="close()" class="text-white/90 hover:text-white cursor-pointer">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Chat body -->
      <div class="chat-body flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <!-- Loading -->
        <div *ngIf="loading" class="flex items-center justify-center py-16 text-gray-400">
          <mat-icon class="animate-spin !mr-2">sync</mat-icon> Loading follow-ups...
        </div>

        <!-- Empty -->
        <div *ngIf="!loading && followUps.length === 0"
          class="flex flex-col items-center justify-center py-16 text-gray-400 text-center">
          <mat-icon class="!text-5xl !w-12 !h-12 mb-3 opacity-40">forum</mat-icon>
          <p class="m-0">No follow-ups yet for this customer.</p>
        </div>

        <!-- Messages -->
        <ng-container *ngFor="let f of followUps">
          <!-- Date separator -->
          <div class="flex justify-center">
            <span class="text-[11px] text-gray-500 bg-gray-200/70 px-3 py-0.5 rounded-full">
              {{ f.followUpDate | date:'mediumDate' }}
            </span>
          </div>

          <!-- Outbound (staff) bubble -->
          <div class="flex justify-end">
            <div class="max-w-[78%] rounded-2xl rounded-tr-sm bg-gray-500 text-white px-3 py-2 shadow-sm">
              <div class="flex items-center gap-1.5 mb-1 text-[11px] font-semibold text-white/90">
                <mat-icon class="!text-sm !w-4 !h-4">{{ f.actionType === 'CALL' ? 'call' : 'chat' }}</mat-icon>
                <span>{{ f.actionType === 'CALL' ? 'Call' : 'WhatsApp' }}</span>
              </div>
              <p class="!m-0 text-sm whitespace-pre-wrap break-words">{{ f.notes }}</p>
              <div *ngIf="f.nextFollowUpDate"
                class="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-white/25 text-[11px] text-white/85">
                <span>Next follow-up: {{ f.nextFollowUpDate | date:'mediumDate' }}</span>
              </div>
            </div>
          </div>

          <!-- Inbound (customer response) bubble -->
          <div *ngIf="f.outcome" class="flex justify-start">
            <div class="max-w-[78%] rounded-2xl rounded-tl-sm bg-white border border-gray-200 text-gray-800 px-3 py-2 shadow-sm">
              <div class="flex items-center gap-1.5 mb-1 text-[11px] font-semibold text-gray-500">
                <mat-icon class="!text-sm !w-4 !h-4">person</mat-icon>
                <span>{{ customerName || 'Customer' }}</span>
              </div>
              <p class="!m-0 text-sm whitespace-pre-wrap break-words">{{ f.outcome }}</p>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 70vh; max-height: 600px; }
    .chat-wrapper { background: #ece5dd; }
    .chat-body {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23d5cfc4'/%3E%3C/svg%3E");
    }
    .animate-spin { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class CustomerFollowupsDialogComponent implements OnInit {
  followUps: FollowUp[] = [];
  loading = true;
  customerName = '';

  constructor(
    private orgService: OrganizationServiceService,
    private dialogRef: MatDialogRef<CustomerFollowupsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { customer: any }
  ) {
    const c = data?.customer;
    this.customerName = c ? `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() : '';
  }

  ngOnInit(): void {
    const customerId = this.data?.customer?.id;
    if (!customerId) {
      this.loading = false;
      return;
    }
    this.orgService.getCustomerFollowUps(customerId).subscribe({
      next: (res) => {
        this.followUps = (res || []).sort(
          (a, b) => new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime()
        );
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading follow-ups:', err);
        this.followUps = [];
        this.loading = false;
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}
