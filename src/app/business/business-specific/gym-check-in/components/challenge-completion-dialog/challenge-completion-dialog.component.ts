import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-challenge-completion-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="completion-container p-8 text-center relative overflow-hidden">
      <!-- Background Glow -->
      <div class="absolute -top-24 -left-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <!-- Close Button with Timer -->
      <div class="absolute top-4 right-4 flex flex-col items-center gap-1">
        <div class="relative w-10 h-10 flex items-center justify-center">
          <svg class="w-full h-full -rotate-90">
            <circle
              cx="20" cy="20" r="18"
              fill="none"
              stroke="#f1f5f9"
              stroke-width="3"
            />
            <circle
              cx="20" cy="20" r="18"
              fill="none"
              stroke="#8b5cf6"
              stroke-width="3"
              stroke-linecap="round"
              [style.stroke-dasharray]="113.1"
              [style.stroke-dashoffset]="113.1 - (113.1 * remainingSeconds / 5)"
              class="transition-all duration-1000 linear"
            />
          </svg>
          <span class="absolute text-[10px] font-black text-slate-800">{{remainingSeconds}}s</span>
        </div>
        <button (click)="close()" class="text-slate-400 hover:text-red-500 transition-colors">
          <mat-icon class="!text-lg">close</mat-icon>
        </button>
      </div>

      <div class="relative z-10 pt-4">
        <div class="w-20 h-20 bg-gradient-to-br from-violet-400 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-500/20 animate-bounce">
          <i class="!text-3xl text-white fa-solid fa-trophy"></i>
        </div>

        <h2 class="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Challenge Completed!</h2>
        <p class="text-lg text-slate-500 font-medium mb-8">Amazing job! You've successfully finished the <span class="text-violet-600 font-bold">{{data.challengeName}}</span>.</p>

        <!-- Reward Card -->
        <div class="bg-slate-50 rounded-2xl p-6 border border-violet-400 mb-6 relative group overflow-hidden">
          <div class="absolute top-0 right-0 p-2">
            <mat-icon class="!text-yellow-500 animate-pulse">stars</mat-icon>
          </div>
          <p class="text-[12px] font-black text-slate-600 uppercase tracking-widest mb-2">Your Reward</p>
          
          <div *ngIf="data.rewardType === 'DISCOUNT'" class="flex items-center justify-center gap-3">
            <div class="text-4xl font-black text-slate-800">{{data.discountPercentage}}%</div>
            <div class="text-left">
              <div class="text-xs font-bold text-slate-600 uppercase leading-none">Discount</div>
              <div class="text-[10px] text-slate-500 font-medium">Voucher Unlocked</div>
            </div>
          </div>

          <div *ngIf="data.rewardType === 'PHYSICAL_PRODUCT'" class="flex flex-col items-center gap-2">
            <div class="w-50 h-50 rounded-xl bg-white flex items-center justify-center text-violet-600 shadow-sm overflow-hidden">
              <mat-icon *ngIf="!data.productDto?.documentDto?.attachments?.[0]?.url" class="!text-3xl">inventory_2</mat-icon>
              <img *ngIf="data.productDto?.documentDto?.attachments?.[0]?.url" 
                   [src]="data.productDto.documentDto.attachments[0].url" 
                   class="w-full h-full object-cover">
            </div>
            <div class="text-sm font-bold text-slate-700">{{data.productDto?.name || 'Physical Reward'}}</div>
          </div>
        </div>

        <!-- Download CTA - Primary Action -->
        <div *ngIf="data.customerRewardDto?.couponCode" class="mt-8">
          <p class="text-[14px] font-black text-green-600 uppercase tracking-widest mb-3 text-center">To Claim Your Reward</p>
          <div class="shine-effect bg-slate-900 rounded-2xl py-4 px-4 flex items-center justify-center gap-4 text-white shadow-xl shadow-slate-200 hover:bg-black transition-all cursor-pointer group">
            <i class="fa-brands fa-google-play text-2xl text-emerald-400 group-hover:scale-110 transition-transform"></i>
            <div class="text-left">
              <p class="text-lg tracking-tight !mb-0 text-white">Download 9myle Android App</p>
              <p class="text-sm font-medium !mb-0">to get coupon code</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .completion-container {
      max-width: 400px;
      background: white;
    }
    .linear {
      transition-timing-function: linear;
    }
    @keyframes shine {
      0% { left: -100%; }
      20% { left: 100%; }
      100% { left: 100%; }
    }
    .shine-effect {
      position: relative;
      overflow: hidden;
    }
    .shine-effect::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 50%;
      height: 100%;
      background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.3) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      transform: skewX(-25deg);
      animation: shine 3s infinite;
    }
  `]
})
export class ChallengeCompletionDialogComponent implements OnInit, OnDestroy {
  remainingSeconds = 6;
  private timerInterval: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ChallengeCompletionDialogComponent>
  ) { }

  ngOnInit() {
    this.celebrate();
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startCountdown() {
    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds <= 0) {
        this.close();
      }
    }, 1000);
  }

  celebrate() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8b5cf6', '#10b981', '#f59e0b']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8b5cf6', '#10b981', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }

  close() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.dialogRef.close();
  }
}
