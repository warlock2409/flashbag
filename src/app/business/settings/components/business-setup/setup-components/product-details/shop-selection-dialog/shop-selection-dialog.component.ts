import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shop-selection-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCheckboxModule, MatButtonModule, FormsModule],
  template: `
    <div class="p-6 bg-white rounded-xl w-full h-full flex flex-col">
      <h2 class="text-xl font-bold mb-4 text-slate-800">Select Shops</h2>
      <p class="text-sm text-slate-500 mb-6">Which shops should this product be available in?</p>
      
      <div class="space-y-3 max-h-[300px] overflow-y-auto mb-8">
        <div *ngFor="let shop of data.shops" class="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
          <mat-checkbox [(ngModel)]="shop.selected" color="primary">
            <span class="text-sm font-semibold text-slate-700">{{shop.name}}</span>
          </mat-checkbox>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button mat-button (click)="onCancel()" class="px-6 py-2 text-slate-500 font-bold uppercase tracking-widest text-[11px]">Cancel</button>
        <button mat-flat-button color="primary" (click)="onConfirm()" 
                class="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-sm hover:shadow-md transition-all">
          Apply to Shops
        </button>
      </div>
    </div>
  `
})
export class ShopSelectionDialogComponent {
  public data = inject<any>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ShopSelectionDialogComponent>);

  constructor() {
    // Default all to selected if they aren't already
    this.data.shops.forEach((shop: any) => {
      if (shop.selected === undefined) shop.selected = true;
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onConfirm() {
    const selectedIds = this.data.shops
      .filter((shop: any) => shop.selected)
      .map((shop: any) => shop.id);
    this.dialogRef.close(selectedIds);
  }
}
