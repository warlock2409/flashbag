import { Component, HostListener, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TrendPanelService } from '../../../services/trend-panel.service';
import { DashboardService, DailyBriefResponse, HealthStatus } from '../../../services/dashboard.service';
import { MembershipSummary } from '../../../models/shop.model';
import { FollowUp } from '../../../models/retention.model';
import { OrganizationServiceService } from '../../../services/organization-service.service';
import { SweatAlertService } from '../../../services/sweat-alert.service';
import { ActionRunnerComponent } from './action-runner.component';

type ActionKey = 'call' | 'whatsapp' | 'report' | 'celebrate';

@Component({
  selector: 'app-trend-panel',
  standalone: true,
  imports: [CommonModule, ActionRunnerComponent],
  template: `
    <!-- Trend Side Panel (Split screen 25% width window) -->
    <div class="fixed top-0 right-0 h-screen bg-zinc-950/95 border-l border-white/10 backdrop-blur-xl transition-all duration-500 ease-in-out z-[999] flex flex-col shadow-2xl"
         [style.width]="isOpen ? (isMobileView ? '100%' : '25%') : '0px'"
         [class.translate-x-full]="!isOpen"
         [class.translate-x-0]="isOpen">
      <div class="p-6 h-full flex flex-col justify-between overflow-y-auto" *ngIf="isOpen">
        <div>
          <div class="space-y-6">
            <!-- Daily Brief -->
            <div class="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-indigo-500/15 via-zinc-900/40 to-zinc-950 border border-white/10">
              <div class="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
              <div class="relative">
                <div class="text-lg font-bold text-white flex !justify-between">
                  <div>
                  {{ greeting }} <span class="ml-1">👋</span>
                  </div>
                  <button (click)="close()" class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>

                <div class="mt-4">
                  <span class="text-xs text-white/50 font-medium">Revenue Risk</span>
                  <div class="mt-1">
                    <span class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">₹{{ dailyBrief.recoverable | number }}</span>
                  </div>
                  <div class="text-xs text-white/50 mt-1">
                    Today's work takes <span class="text-white/80 font-semibold">{{ dailyBrief.minutes }} minutes</span>
                  </div>
                </div>

                <div class="space-y-2 !mt-4">
                  <button *ngFor="let a of actions" (click)="runAction(a)"
                          class="!mt-2 w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors cursor-pointer text-left">
                    <div class="flex items-center space-x-3">
                      <span class="text-lg leading-none">{{ a.emoji }}</span>
                      <span class="text-sm text-white/80">{{ a.label }}</span>
                    </div>
                    <span class="min-w-6 h-6 px-2 flex items-center justify-center rounded-full text-xs font-bold" [ngClass]="a.badgeClass">{{ a.count }}</span>
                  </button>
                </div>

                <button (click)="startBrief()"
                        class="w-full !mt-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white text-sm font-semibold transition-all cursor-pointer flex items-center justify-center space-x-2">
                  <i class="fa-solid fa-play text-sm text-green-400"></i>
                  <span>Start</span>
                </button>
              </div>
            </div>

            <!-- Today's Follow-ups -->
            <div class="space-y-3">
              <div class="flex items-center justify-between px-1">
                <h4 class="!m-0 text-sm font-bold text-white/90 flex items-center gap-2">
                  <i class="fa-solid fa-list-check text-indigo-300"></i> Today's Follow-ups
                </h4>
                <span *ngIf="!followUpsLoading" class="text-[11px] text-white/40">{{ followUpsTotal }} total</span>
              </div>

              <!-- Loading -->
              <div *ngIf="followUpsLoading" class="flex items-center justify-center py-6 text-white/40 text-xs">
                <i class="fa-solid fa-spinner fa-spin mr-2"></i> Loading follow-ups...
              </div>

              <!-- Empty -->
              <div *ngIf="!followUpsLoading && followUps.length === 0"
                   class="bg-white/5 rounded-2xl p-5 border border-white/5 text-center text-xs text-white/40">
                No follow-ups logged today yet.
              </div>

              <!-- List -->
              <div *ngIf="!followUpsLoading && followUps.length > 0"
                   class="space-y-2 max-h-80 overflow-y-auto pr-1 followups-scroll">
                <div *ngFor="let f of followUps"
                     class="group bg-white/5 hover:bg-white/[0.08] rounded-2xl p-3 border border-white/5 transition-colors">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                            [ngClass]="f.actionType === 'CALL' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'">
                        <i class="fa-solid" [ngClass]="f.actionType === 'CALL' ? 'fa-phone' : 'fa-comment-dots'"></i>
                      </span>
                      <div class="min-w-0">
                        <p class="!m-0 text-sm font-semibold text-white/90 truncate">
                          {{ f.customerName || ('Customer #' + f.customerId) }}
                        </p>
                        <p class="!m-0 text-[11px] text-white/40">
                          {{ f.actionType === 'CALL' ? 'Call' : 'WhatsApp' }}
                        </p>
                      </div>
                    </div>
                    <button (click)="deleteFollowUp(f)"
                            class="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-300 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                            title="Delete follow-up">
                      <i class="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>

                  <p *ngIf="f.notes" class="!mt-2 !mb-0 text-xs text-white/60 line-clamp-2">{{ f.notes }}</p>

                  <div *ngIf="f.outcome"
                       class="!mt-2 text-xs text-emerald-300/90 bg-emerald-500/10 rounded-lg px-2 py-1 border border-emerald-500/10">
                    <i class="fa-solid fa-reply mr-1"></i>{{ f.outcome }}
                  </div>

                  <div *ngIf="f.nextFollowUpDate" class="!mt-2 flex items-center gap-1 text-[11px] text-white/40">
                    <i class="fa-regular fa-calendar"></i> Next: {{ f.nextFollowUpDate | date:'mediumDate' }}
                  </div>
                </div>

                <!-- Load more -->
                <button *ngIf="followUps.length < followUpsTotal" (click)="loadMoreFollowUps()"
                        [disabled]="followUpsLoadingMore"
                        class="w-full !mt-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50">
                  <i class="fa-solid fa-spinner fa-spin mr-1" *ngIf="followUpsLoadingMore"></i>
                  {{ followUpsLoadingMore ? 'Loading...' : 'Load more' }}
                </button>
              </div>
            </div>

            <!-- Trend Analysis -->
            <!-- <div class="space-y-3">
              <div class="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
                <div class="space-y-1" *ngFor="let b of hourlyBreakdown">
                  <div class="flex justify-between text-xs">
                    <span class="text-white/60">{{ b.label }}</span>
                    <span class="text-white font-medium">{{ b.count }} <span class="text-white/40 font-normal">({{ b.percent }}%)</span></span>
                  </div>
                  <div class="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div class="h-1.5 rounded-full transition-all duration-500" [ngClass]="b.color" [style.width.%]="b.percent"></div>
                  </div>
                </div>
                <div *ngIf="!hourlyBreakdown.length" class="text-xs text-white/40 text-center py-3">
                  No check-in data available yet.
                </div>
              </div>
            </div> -->
          </div>
        </div>
        
        <div class="text-center">
          <span class="flashbag-glow text-[12px] tracking-widest uppercase">9Myle Intelligence</span>
        </div>
      </div>
    </div>

    <!-- Action Runner Modal -->
    <app-action-runner [open]="runnerOpen" (openChange)="onRunnerOpenChange($event)"
      [startAction]="runnerStartAction"></app-action-runner>
  `,
  styles: [`
    .followups-scroll::-webkit-scrollbar {
      width: 6px;
    }
    .followups-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    .followups-scroll::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 9999px;
    }
    .followups-scroll::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.25);
    }
    .followups-scroll {
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
    }

    /* "Flashbag Intelligence" — a violet-400 glow sweeping behind the text.
       A moving highlight is clipped to the letters so only the text glows. */
    .flashbag-glow {
      display: inline-block;
      font-weight: 600;
      background: linear-gradient(
        100deg,
        rgba(255, 255, 255, 0.28) 0%,
        rgba(255, 255, 255, 0.28) 35%,
        #a78bfa 50%,
        rgba(255, 255, 255, 0.28) 65%,
        rgba(255, 255, 255, 0.28) 100%
      );
      background-size: 250% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
      animation: flashbag-sweep 3s linear infinite;
    }
    @keyframes flashbag-sweep {
      0%   { background-position: 150% 0; }
      100% { background-position: -50% 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .flashbag-glow { animation: none; }
    }
  `]
})
export class TrendPanelComponent implements OnInit, OnDestroy {
  isOpen = false;
  isMobileView = false;
  membershipSummary: MembershipSummary | null = null;
  greeting = 'Good Morning';
  dailyBrief = {
    minutes: 14,
    calls: 3,
    messages: 5,
    recoverable: 0
  };
  hourlyBreakdown: { label: string; count: number; percent: number; color: string }[] = [];
  runnerOpen = false;
  runnerStartAction: ActionKey | null = null;
  actions: { key: ActionKey; emoji: string; label: string; status: HealthStatus; count: number; badgeClass: string }[] = [
    { key: 'call', emoji: '🔥', label: 'Call Now', status: 'CRITICAL', count: 0, badgeClass: 'bg-red-500/20 text-red-300' },
    { key: 'whatsapp', emoji: '💬', label: 'Send WhatsApp', status: 'NEEDS_ATTENTION', count: 0, badgeClass: 'bg-green-500/20 text-green-300' },
    { key: 'report', emoji: '📊', label: 'Send Report', status: 'WATCH', count: 0, badgeClass: 'bg-blue-500/20 text-blue-300' },
    { key: 'celebrate', emoji: '🎉', label: 'Celebrate', status: 'HEALTHY', count: 0, badgeClass: 'bg-purple-500/20 text-purple-300' }
  ];
  private sub = new Subscription();

  // Today's follow-ups list
  followUps: (FollowUp & { customerName?: string })[] = [];
  followUpsLoading = false;
  followUpsLoadingMore = false;
  followUpsPage = 0;
  followUpsSize = 5;
  followUpsTotal = 0;

  trendPanelService = inject(TrendPanelService);
  dashboardService = inject(DashboardService);
  orgService = inject(OrganizationServiceService);
  swalService = inject(SweatAlertService);

  ngOnInit() {
    this.checkScreenSize();
    this.setGreeting();
    this.sub.add(
      this.trendPanelService.isOpen$.subscribe(isOpen => {
        this.isOpen = isOpen;
        if (isOpen) {
          this.loadData();
        }
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobileView = window.innerWidth <= 768;
  }

  close() {
    this.trendPanelService.close();
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 17) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

  runAction(action: { key: ActionKey; count: number }) {
    // Open the runner jumped to this action's section.
    this.runnerStartAction = action.key;
    this.runnerOpen = true;
  }

  startBrief() {
    // Start from the top of the queue.
    this.runnerStartAction = null;
    this.runnerOpen = true;
  }

  onRunnerOpenChange(open: boolean) {
    this.runnerOpen = open;
    // When the action runner closes, refresh the daily brief so the panel's
    // counts reflect any follow-ups just logged.
    if (!open) {
      this.dashboardService.getDailyBrief().subscribe({
        next: (res) => this.applyDailyBrief(res),
        error: (err) => console.error('Error refreshing daily brief after action runner:', err)
      });
      // Refresh today's follow-ups so newly logged outreach appears in the list.
      this.loadFollowUps();
    }
  }

  loadData() {
    try {
      this.dashboardService.getMembershipSummary().subscribe({
        next: (res) => {
          this.membershipSummary = res.data;
        },
        error: (err) => console.error('Error fetching membership summary for trend panel:', err)
      });

      // this.dashboardService.getHourlyCheckIns().subscribe({
      //   next: (res) => {
      //     this.hourlyBreakdown = this.buildHourlyBreakdown(res || []);
      //   },
      //   error: (err) => console.error('Error fetching hourly comparison for trend panel:', err)
      // });

      this.dashboardService.getDailyBrief().subscribe({
        next: (res) => this.applyDailyBrief(res),
        error: (err) => console.error('Error fetching daily brief for trend panel:', err)
      });

      this.loadFollowUps();
    } catch (e) {
      console.warn('DashboardService requires active shopCode:', e);
    }
  }

  // Local date (YYYY-MM-DD) for today's follow-ups.
  private todayDate(): string {
    const d = new Date();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  loadFollowUps() {
    this.followUpsLoading = true;
    this.followUpsPage = 0;
    this.orgService.getFollowUpsByDate(this.todayDate(), this.followUpsPage, this.followUpsSize).subscribe({
      next: (res) => {
        this.followUps = res?.content || [];
        this.followUpsTotal = res?.totalElements ?? this.followUps.length;
        this.followUpsLoading = false;
      },
      error: (err) => {
        console.error('Error fetching follow-ups for trend panel:', err);
        this.followUps = [];
        this.followUpsTotal = 0;
        this.followUpsLoading = false;
      }
    });
  }

  loadMoreFollowUps() {
    this.followUpsLoadingMore = true;
    this.followUpsPage += 1;
    this.orgService.getFollowUpsByDate(this.todayDate(), this.followUpsPage, this.followUpsSize).subscribe({
      next: (res) => {
        this.followUps = [...this.followUps, ...(res?.content || [])];
        this.followUpsTotal = res?.totalElements ?? this.followUps.length;
        this.followUpsLoadingMore = false;
      },
      error: (err) => {
        console.error('Error fetching more follow-ups:', err);
        this.followUpsPage -= 1;
        this.followUpsLoadingMore = false;
      }
    });
  }

  deleteFollowUp(followUp: FollowUp) {
    this.swalService.confirm(
      'Are you sure you want to delete this follow-up? This action cannot be undone.',
      'Delete Follow-up',
      'Delete',
      'Cancel'
    ).then((result) => {
      if (result.isConfirmed) {
        this.orgService.deleteFollowUp(followUp.id).subscribe({
          next: () => {
            this.followUps = this.followUps.filter(f => f.id !== followUp.id);
            this.followUpsTotal = Math.max(0, this.followUpsTotal - 1);
            this.swalService.success('Follow-up deleted');
          },
          error: (err) => {
            console.error('Error deleting follow-up:', err);
            this.swalService.error('Failed to delete follow-up');
          }
        });
      }
    });
  }

  // Maps the daily-brief API into the panel:
  // - Revenue Risk = NEEDS_ATTENTION + WATCH + CRITICAL (HEALTHY excluded)
  // - Each action count comes from countsByStatus for its mapped status.
  applyDailyBrief(res: DailyBriefResponse) {
    const risk = res.revenueRiskByStatus || ({} as Record<HealthStatus, number>);
    this.dailyBrief.recoverable =
      (risk.NEEDS_ATTENTION || 0) + (risk.WATCH || 0) + (risk.CRITICAL || 0);

    const counts = res.countsByStatus || ({} as Record<HealthStatus, number>);
    this.actions.forEach(a => (a.count = counts[a.status] || 0));
  }

  // Buckets the hourly comparison data (today's check-ins) into
  // Morning / Afternoon / Evening and renders each as a share of the day's total.
  // The endpoint returns 2-hour windows (hour = 0, 2, 4 ... 22), so bucket
  // boundaries are kept on even hours and cover the whole day (nothing dropped).
  buildHourlyBreakdown(data: { hour: number; todayMembers: number; meanMembers: number }[]) {
    const buckets = [
      { label: 'Morning (Before 12 PM)', from: 0, to: 12, color: 'bg-yellow-400', total: 0 },
      { label: 'Afternoon (12 - 4 PM)', from: 12, to: 16, color: 'bg-orange-400', total: 0 },
      { label: 'Evening (After 4 PM)', from: 16, to: 24, color: 'bg-red-400', total: 0 }
    ];

    for (const d of data) {
      const bucket = buckets.find(b => d.hour >= b.from && d.hour < b.to);
      if (bucket) bucket.total += d.todayMembers || 0;
    }

    const grandTotal = buckets.reduce((sum, b) => sum + b.total, 0);

    return buckets.map(b => ({
      label: b.label,
      color: b.color,
      count: b.total,
      percent: grandTotal ? Math.round((b.total / grandTotal) * 100) : 0
    }));
  }

}
