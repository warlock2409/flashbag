import { Component, Inject, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-qr-print-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="qr-preview-container p-4 md:p-6 bg-white rounded-2xl max-w-sm mx-auto overflow-hidden">
      <!-- Header Preview (Outside download) -->
      <div class="text-center mb-6">
        <h3 class="text-lg font-bold text-slate-800">Print Preview</h3>
        <p class="text-slate-500 text-xs font-medium">Download this poster to display at your gym</p>
      </div>

      <!-- QR Code Region (The part that will be downloaded) -->
      <div #downloadRegion class="bg-white p-8 md:p-10 flex flex-col items-center border border-slate-100 shadow-sm rounded-xl">
         <!-- Logo inside download region -->
         <div class="h-16 w-16 mb-6 flex items-center justify-center">
           <img src="../../../../../assets/png/logo.png" alt="9Myle Logo" class="h-full w-auto object-contain">
         </div>
         
         <h2 class="text-2xl font-black text-slate-800 tracking-tight text-center mb-8">Scan to Check In</h2>

         <div class="bg-white p-5 rounded-3xl shadow-xl border border-slate-50 mb-8">
            <canvas #qrCanvas class="w-full h-auto aspect-square"></canvas>
         </div>
         
         <div class="text-center">
            <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Facility Code</div>
            <div class="text-2xl font-black text-blue-600 tracking-wider">#{{shopCode | uppercase}}</div>
            <p class="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Powered by 9Myle</p>
         </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-3 mt-2">
        <button (click)="downloadQR()" [disabled]="isDownloading" class="w-full py-4 px-6 bg-[#0052cc] !text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
          <i class="fa-solid" [class.fa-download]="!isDownloading" [class.fa-spinner]="isDownloading" [class.animate-spin]="isDownloading"></i>
          {{ isDownloading ? 'Generating Poster...' : 'Download Print Ready QR' }}
        </button>
        <button [mat-dialog-close]="false" class="w-full py-4 text-slate-500 font-bold hover:text-slate-800 transition-colors">
          Close Preview
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background: #ffffff;
    }
    .qr-preview-container {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
  `]
})
export class QrPrintDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('downloadRegion') downloadRegion!: ElementRef<HTMLDivElement>;

  shopCode: string = '';
  isDownloading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<QrPrintDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.shopCode = localStorage.getItem('shopCode') || '';
  }

  ngOnInit() { }

  async ngAfterViewInit() {
    this.generateQRCode();
  }

  async generateQRCode() {
    try {
      const QRCodeModule = await import('qrcode');
      const toCanvasFunc = QRCodeModule.toCanvas || QRCodeModule.default?.toCanvas || QRCodeModule["default"];

      if (toCanvasFunc && typeof toCanvasFunc === 'function') {
        toCanvasFunc(this.qrCanvas.nativeElement, this.shopCode, {
          width: 320,
          margin: 1,
          color: {
            dark: '#1e293b', // slate-800
            light: '#ffffff'
          }
        });
      }
    } catch (err) {
      console.error('QR generation failed in dialog:', err);
    }
  }

  async downloadQR() {
    if (this.isDownloading) return;
    this.isDownloading = true;

    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(this.downloadRegion.nativeElement, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `CheckIn-Poster-${this.shopCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback to just canvas
      const canvas = this.qrCanvas.nativeElement;
      const link = document.createElement('a');
      link.download = `CheckIn-QR-${this.shopCode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      this.isDownloading = false;
    }
  }
}
