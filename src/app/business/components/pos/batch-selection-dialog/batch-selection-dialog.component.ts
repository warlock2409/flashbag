import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-batch-selection-dialog',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  template: `
    <div class="p-6 max-h-[80vh] flex flex-col bg-white rounded-xl">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Select Batch</h2>
          <p class="text-sm text-gray-500 mt-1">{{ data.product.productName }}</p>
        </div>
        <button (click)="close()" class="text-gray-400 hover:text-red-500 cursor-pointer">
          <i class="fa-solid fa-times text-xl"></i>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto space-y-4">
        <div *ngFor="let batch of filteredBatches" 
             (click)="selectBatch(batch)"
             class="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-violet-500 hover:bg-violet-50 transition-all flex justify-between items-center group">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-gray-800">#{{ batch.batchNumber }}</span>
              <span *ngIf="batch.status === 'ACTIVE'" class="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Active</span>
              <span *ngIf="batch.expiringSoon" class="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Expiring Soon</span>
            </div>
            <div class="text-xs text-gray-500">
              Exp: {{ batch.expiryDate | date:'mediumDate' }}
            </div>
          </div>
          
          <div class="text-right">
            <div class="text-green-600 font-bold text-lg mb-1">
              {{ batch.sellingPrice | currency:'INR':'symbol':'1.2-2' }}
            </div>
            <div class="text-xs font-medium" [ngClass]="batch.availableQuantity > 0 ? 'text-gray-600' : 'text-red-500'">
              {{ batch.availableQuantity }} available
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BatchSelectionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BatchSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: any, batches: any[] }
  ) {}

  get filteredBatches() {
    return this.data?.batches?.filter(batch => batch.availableQuantity > 0) || [];
  }

  selectBatch(batch: any): void {
    if(batch.availableQuantity > 0) {
      this.dialogRef.close(batch);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
