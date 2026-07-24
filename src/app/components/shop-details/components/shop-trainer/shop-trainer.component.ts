import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TrainerAchievement {
  icon: string;
  label: string;
}

interface ClientTransformation {
  name: string;
  result: string;
  beforeImage: string;
  afterImage: string;
}

@Component({
  selector: 'app-shop-trainer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-10 border-t border-slate-800">
      <h2 class="text-xl font-bold !text-white mb-6">Meet Your Coach</h2>

      <div class="bg-slate-800/50 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
        <!-- Trainer header: photo gallery + name + achievements -->
        <div class="grid grid-cols-1 md:grid-cols-[280px_1fr]">
          <div class="p-4 md:p-5 flex flex-col gap-3">
            <!-- Focused image -->
            <div
              class="relative rounded-xl overflow-hidden cursor-zoom-in group"
              (click)="openZoom(activeIndex)">
              <img
                [src]="trainerImages[activeIndex]"
                [alt]="trainerName" style="object-position: top;"
                class="w-full h-64 md:h-72 object-cover transition-transform duration-500 group-hover:scale-105">
              <span class="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-full flex items-center gap-1">
                🔍 Tap to zoom
              </span>
            </div>

            <!-- Thumbnails -->
            <div class="flex gap-2">
              <button
                type="button"
                *ngFor="let img of trainerImages; let i = index"
                (click)="setActive(i)"
                class="relative rounded-lg overflow-hidden flex-1 h-14 border-2 transition-all"
                [ngClass]="i === activeIndex ? 'border-violet-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'">
                <img [src]="img" [alt]="trainerName + ' photo ' + (i + 1)" class="w-full h-full object-cover">
              </button>
            </div>
          </div>

          <div class="p-6">
            <p class="text-sm font-medium text-violet-400 mb-1">{{ gymName }}</p>
            <h3 class="text-2xl font-bold !text-white mb-1">{{ trainerName }}</h3>
            <p class="text-sm !text-slate-400 mb-6">{{ role }}</p>

            <h4 class="text-xs font-semibold uppercase tracking-wider !text-slate-500 mb-3">
              Biggest Achievements
            </h4>
            <ul class="space-y-3">
              <li
                *ngFor="let achievement of achievements"
                class="flex items-center gap-3 text-sm text-slate-200">
                <span class="text-lg leading-none">{{ achievement.icon }}</span>
                <span>{{ achievement.label }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Before / after client transformations -->
        <!-- <div class="px-6 pt-6 border-t border-slate-700">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
            Client Transformations
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              *ngFor="let client of transformations"
              class="bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden">
              <div class="grid grid-cols-2">
                <div class="relative">
                  <img [src]="client.beforeImage" [alt]="client.name + ' before'" class="w-full h-36 object-cover">
                  <span class="absolute top-2 left-2 text-[10px] font-bold uppercase bg-black/60 text-white px-2 py-0.5 rounded">Before</span>
                </div>
                <div class="relative">
                  <img [src]="client.afterImage" [alt]="client.name + ' after'" class="w-full h-36 object-cover">
                  <span class="absolute top-2 right-2 text-[10px] font-bold uppercase bg-violet-500 text-white px-2 py-0.5 rounded">After</span>
                </div>
              </div>
              <div class="p-3">
                <p class="text-sm font-semibold !text-white leading-tight">{{ client.name }}</p>
                <p class="text-xs !text-slate-400">{{ client.result }}</p>
              </div>
            </div>
          </div>
        </div> -->

        <!-- Short philosophy -->
        <div class="px-6 py-6">
          <h4 class="text-xs font-semibold uppercase tracking-wider !text-slate-500 !mb-3">
            My Philosophy
          </h4>
          <p class="text-sm !text-slate-300 leading-relaxed italic border-l-2 border-violet-500 pl-4">
            {{ philosophy }}
          </p>
        </div>

        <!-- CTA -->
        <div class="px-6 pb-6">
          <button
            type="button"
            (click)="onBookSession()"
            class="w-full sm:w-auto px-6 py-3 bg-violet-400 hover:bg-violet-600 text-white rounded-xl text-sm transition-all shadow-lg hover:scale-[1.02] active:scale-95 border border-violet-400/60">
            {{ ctaLabel }}
          </button>
        </div>
      </div>
    </div>

    <!-- Zoom / lightbox overlay -->
    <div
      *ngIf="zoomIndex !== null"
      class="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      (click)="closeZoom()">
      <button
        type="button"
        (click)="closeZoom()"
        class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl leading-none flex items-center justify-center transition-colors">
        &times;
      </button>

      <!-- Prev -->
      <button
        type="button"
        *ngIf="trainerImages.length > 1"
        (click)="prevZoom($event)"
        class="absolute left-3 sm:left-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition-colors">
        &#8249;
      </button>

      <img
        [src]="trainerImages[zoomIndex]"
        [alt]="trainerName"
        (click)="$event.stopPropagation()"
        class="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl">

      <!-- Next -->
      <button
        type="button"
        *ngIf="trainerImages.length > 1"
        (click)="nextZoom($event)"
        class="absolute right-3 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition-colors">
        &#8250;
      </button>

      <span class="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/80 text-xs font-medium">
        {{ zoomIndex + 1 }} / {{ trainerImages.length }}
      </span>
    </div>
  `,
  styles: []
})
export class ShopTrainerComponent implements OnInit, OnDestroy {
  @Input() gymName: string = 'BI FIT Gym & Fitness';
  @Input() trainerName: string = 'Biju';
  @Input() role: string = 'Trainer';

  @Input() trainerImages: string[] = [
    'https://pub-f3cc65a63e2a4ca88e58aae1aedfa9f6.r2.dev/biju_profile.png',
    'https://pub-f3cc65a63e2a4ca88e58aae1aedfa9f6.r2.dev/biju_gympose.png',
    'https://pub-f3cc65a63e2a4ca88e58aae1aedfa9f6.r2.dev/biju.png',
    // 'https://pub-f3cc65a63e2a4ca88e58aae1aedfa9f6.r2.dev/biju_stagepose.png',
    'https://pub-f3cc65a63e2a4ca88e58aae1aedfa9f6.r2.dev/buju_pose.png',
  ];

  /** Auto-rotate interval in milliseconds. */
  @Input() rotateIntervalMs: number = 5000;

  @Input() achievements: TrainerAchievement[] = [
    { icon: '🥈', label: 'Musclemania Runner-up (2014)' },
    { icon: '✅', label: 'Mr. India – 2nd Place (2011)' },
    { icon: '🏆', label: '6× Mr. Coimbatore Champion' },
    { icon: '🍽️', label: 'Personal Trainer' },
    { icon: '💪', label: '12+ Years of Coaching Experience' }
  ];

  @Input() transformations: ClientTransformation[] = [
    {
      name: 'Arun K.',
      result: 'Lost 18 kg in 6 months',
      beforeImage: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&w=300&q=80',
      afterImage: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Priya S.',
      result: 'Gained strength & confidence',
      beforeImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=300&q=80',
      afterImage: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Ravi M.',
      result: 'Built 8 kg lean muscle',
      beforeImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=300&q=80',
      afterImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=300&q=80'
    }
  ];

  @Input() philosophy: string =
    "I've spent the last 12 years helping busy people become stronger, healthier, and more confident. My coaching isn't about quick fixes it's about building habits that last. Every member receives personal attention, nutrition guidance, and accountability throughout their journey.";

  @Input() ctaLabel: string = 'Book a Session with Biju';

  /**
   * Emitted when the user taps the CTA. The parent decides what to do:
   * book a visit with the recommended plan, or fall back to WhatsApp.
   */
  @Output() bookSession = new EventEmitter<void>();

  activeIndex = 0;
  zoomIndex: number | null = null;

  private rotateTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.startAutoRotate();
  }

  ngOnDestroy(): void {
    this.stopAutoRotate();
  }

  private startAutoRotate(): void {
    if (this.trainerImages.length <= 1 || this.rotateIntervalMs <= 0) {
      return;
    }
    this.stopAutoRotate();
    this.rotateTimer = setInterval(() => {
      // Pause rotation while the zoom view is open.
      if (this.zoomIndex === null) {
        this.activeIndex = (this.activeIndex + 1) % this.trainerImages.length;
      }
    }, this.rotateIntervalMs);
  }

  private stopAutoRotate(): void {
    if (this.rotateTimer) {
      clearInterval(this.rotateTimer);
      this.rotateTimer = null;
    }
  }

  setActive(index: number): void {
    this.activeIndex = index;
    // Restart the timer so the manually-selected image gets a full interval.
    this.startAutoRotate();
  }

  openZoom(index: number): void {
    this.zoomIndex = index;
  }

  closeZoom(): void {
    this.zoomIndex = null;
  }

  nextZoom(event: Event): void {
    event.stopPropagation();
    if (this.zoomIndex === null) return;
    this.zoomIndex = (this.zoomIndex + 1) % this.trainerImages.length;
  }

  prevZoom(event: Event): void {
    event.stopPropagation();
    if (this.zoomIndex === null) return;
    this.zoomIndex = (this.zoomIndex - 1 + this.trainerImages.length) % this.trainerImages.length;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.zoomIndex === null) return;
    if (event.key === 'Escape') this.closeZoom();
    else if (event.key === 'ArrowRight') this.nextZoom(event);
    else if (event.key === 'ArrowLeft') this.prevZoom(event);
  }

  onBookSession(): void {
    this.bookSession.emit();
  }
}
