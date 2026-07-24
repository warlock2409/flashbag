import { Component, EventEmitter, Input, Output, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DashboardService, HealthStatus, FollowUpActionType } from '../../../services/dashboard.service';
import { OrganizationServiceService } from '../../../services/organization-service.service';
import { HealthFeature, HealthStatusRecord } from '../../../models/retention.model';
import { SidePanelComponent } from '../side-panel/side-panel.component';
import { CustomerConfigurePanelComponent } from '../../../business/customers/customer-configure-panel';
import { CustomersActionsComponent } from '../../../business/customers/customers-actions/customers-actions.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

type ActionKey = 'call' | 'whatsapp' | 'report' | 'celebrate';
type CallOutcome =
  | 'CONTACTED'
  | 'NO_RESPONSE'
  | 'WILL_RETURN'
  | 'TRAVELLING'
  | 'SICK'
  | 'FINANCIAL_ISSUE'
  | 'SWITCHED_PROVIDER'
  | 'NOT_INTERESTED'
  | 'OTHER'
  | 'DND';

interface RunnerCustomer {
  customerId: number;
  name: string;
  phone: string;
  photoUrl: string;
  health: 'Critical' | 'At Risk' | 'Healthy';
  healthScore: number;
  membershipName: string;
  reasons: string[];
  expectedRecovery: number;
  // Workout progress (from getCustomerProgress):
  totalVisits: number;
  streak: number;
  remainingDays: number;
  averageDuration: number;
  longestDuration: number;
  shortestDuration: number;
  heatmapData: HeatmapMonth[];
  growth: number; // month-over-month attendance growth %
  attendanceByWeek: WeeklyAttendance[];
  dto: any; // raw customerDTO (for the configure panel)
}

interface WeeklyAttendance {
  weekStart: string; // YYYY-MM-DD (Sunday)
  visits: number;
  avgDuration: number; // minutes
}

interface HeatmapDay {
  date?: string;
  duration: number;
  level: number; // 0-3 intensity
  empty: boolean;
  future: boolean;
}

interface HeatmapMonth {
  heatmapData: HeatmapDay[];
  monthLabel: string;
}

interface QueueItem {
  actionKey: ActionKey;
  record: HealthStatusRecord;
  // Customer details are fetched lazily, only when this item is shown.
  customer: RunnerCustomer | null;
  loadingCustomer?: boolean;
}

@Component({
  selector: 'app-action-runner',
  standalone: true,
  imports: [CommonModule, FormsModule, SidePanelComponent, CustomerConfigurePanelComponent, MatDialogModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="close()"></div>

      <div class="relative w-full max-w-md max-h-[90vh] flex flex-col bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <!-- Progress -->
        <div class="h-1 bg-white/10 shrink-0">
          <div class="h-1 bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" [style.width.%]="progress"></div>
        </div>

        <!-- Loading state (fetching the record list) -->
        <div *ngIf="showSpinner" class="p-10 flex flex-col items-center justify-center gap-3">
          <i class="fa-solid fa-spinner fa-spin text-2xl text-indigo-400"></i>
          <span class="text-sm text-white/50">Loading customers…</span>
        </div>

        <ng-container *ngIf="!showSpinner">
        <ng-container *ngIf="current as c; else done">
          <div class="p-6 overflow-y-auto">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold tracking-widest text-white/80">{{ headerFor(c.actionKey) }}</span>
              <div class="flex items-center !gap-2">
                <span class="text-[11px] text-white/40">{{ positionLabel }}</span>
                <button (click)="close()" class="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer">
                  <i class="fa-solid fa-xmark text-xs text-white"></i>
                </button>
              </div>
            </div>

            <!-- View phase -->
            <ng-container *ngIf="phase === 'view'">
              <ng-container *ngIf="c.customer as cust; else custLoading">
              <div class="flex items-center justify-between gap-4">
                <div class="min-w-0">
                  <h3 class="text-xl font-bold !text-white m-0 truncate cursor-pointer hover:underline"
                      (click)="openConfigure(cust)" title="Configure customer">{{ cust.name }}</h3>
                  <div class="text-xs truncate" [ngClass]="cust.membershipName ? 'text-white/50' : 'text-red-300/80'">
                    {{ cust.membershipName || 'No active membership' }}
                  </div>
                </div>
                <div class="relative w-16 h-16 shrink-0">
                  <div class="w-16 h-16 rounded-full overflow-hidden bg-white/10 flex items-center justify-center"
                       [class.cursor-zoom-in]="cust.photoUrl"
                       (click)="cust.photoUrl && openZoom(cust.photoUrl)">
                    <img *ngIf="cust.photoUrl" [src]="cust.photoUrl" alt="" class="w-full h-full object-cover" />
                    <span *ngIf="!cust.photoUrl" class="text-base font-semibold text-white/70">{{ initials(cust.name) }}</span>
                  </div>
                  <!-- Membership status light: green = active membership, red = none -->
                  <span class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-zinc-900 pointer-events-none"
                        [ngClass]="cust.membershipName ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]'"
                        [title]="cust.membershipName ? 'Active membership' : 'No active membership'"></span>
                </div>
              </div>

              <div class="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" [ngClass]="healthClass(cust.health)">
                <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                Health · {{ cust.health }}
              </div>

              <div class="mt-4" *ngIf="cust.reasons?.length">
                <div class="text-xs text-white/70 uppercase tracking-wider mb-2">Why?</div>
                <ul class="space-y-1.5 list-none p-0 m-0">
                  <li *ngFor="let r of cust.reasons" class="flex items-start gap-2 text-sm text-white/70">
                    <span class="text-violet/50 mt-0.5">•</span><span>{{ r }}</span>
                  </li>
                </ul>
              </div>

              <div class="mt-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                <div class="text-[12px] text-white/70">Expected recovery</div>
                <div class="text-2xl text-emerald-300">₹{{ cust.expectedRecovery | number }}</div>
              </div>

              <!-- Attendance heatmap -->
              <div class="mt-4" *ngIf="cust.heatmapData?.length; else noAttendance">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs text-white/70 uppercase tracking-wider">Attendance</span>
                  <span class="text-[11px] text-white/40">{{ cust.totalVisits }} visits · {{ cust.streak }}🔥</span>
                </div>
                <div class="rounded-2xl bg-white/5 border border-white/5 p-3 overflow-x-auto">
                  <div class="flex gap-5 w-max">
                    <div class="flex-shrink-0" *ngFor="let monthData of cust.heatmapData">
                      <div class="text-[11px] font-medium text-white/50 mb-2">{{ monthData.monthLabel }}</div>
                      <div class="flex gap-2">
                        <!-- Weekday labels (match grid rows) -->
                        <div class="grid grid-rows-7 gap-[3px] text-[9px] text-white/30 flex-shrink-0">
                          <div class="h-4 flex items-center">S</div>
                          <div class="h-4 flex items-center">M</div>
                          <div class="h-4 flex items-center">T</div>
                          <div class="h-4 flex items-center">W</div>
                          <div class="h-4 flex items-center">T</div>
                          <div class="h-4 flex items-center">F</div>
                          <div class="h-4 flex items-center">S</div>
                        </div>
                        <!-- Heatmap grid (weeks flow as columns) -->
                        <div class="grid grid-rows-7 grid-flow-col gap-[3px] w-max">
                          <div *ngFor="let day of monthData.heatmapData"
                               class="w-4 h-4 rounded-sm transition-colors duration-200"
                               [ngClass]="{
                                 'bg-transparent': day.empty,
                                 'bg-white/5 cursor-not-allowed': day.future,
                                 'bg-red-500/20': !day.future && !day.empty && day.level === 0,
                                 'bg-emerald-500/30': !day.future && day.level === 1,
                                 'bg-emerald-500/60': !day.future && day.level === 2,
                                 'bg-emerald-400': !day.future && day.level === 3
                               }"
                               [title]="day.empty ? '' :
                                 day.future ? (day.date + ' - Future') :
                                 (day.date + (day.duration ? ' - ' + (day.duration | number:'1.0-0') + ' mins' : ' - No visit'))">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <ng-template #noAttendance>
                <div class="mt-4 rounded-2xl bg-white/5 border border-white/5 p-4 text-center text-xs text-white/40">
                  No attendance data yet.
                </div>
              </ng-template>

              <div class="grid grid-cols-2 gap-3 mt-5">
                <button (click)="skip()" class="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 !text-white/70 text-sm transition-colors cursor-pointer">
                  Skip
                </button>
                <button (click)="primary(c)" class="py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2">
                  <i class="text-xs" [ngClass]="primaryIcon(c.actionKey)"></i>
                  {{ primaryLabel(c.actionKey) }}
                </button>
              </div>
              </ng-container>

              <!-- Customer details still loading for this card -->
              <ng-template #custLoading>
                <div class="py-10 flex flex-col items-center justify-center gap-3">
                  <i class="fa-solid fa-spinner fa-spin text-xl text-indigo-400"></i>
                  <span class="text-sm text-white/50">Loading details…</span>
                </div>
              </ng-template>
            </ng-container>

            <!-- Outcome phase (call) -->
            <ng-container *ngIf="phase === 'outcome'">
              <div class="flex items-center gap-2">
                <button (click)="phase = 'view'" class="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer">
                  <i class="fa-solid fa-chevron-left text-xs text-white"></i>
                </button>
                <h3 class="text-lg font-bold !text-white m-0">Log outcome</h3>
              </div>

              <p class="text-xs text-white/50 !mt-2 mb-0">{{ c.customer?.name }}</p>

              <!-- Phone number (display only) -->
              <div *ngIf="c.customer?.phone as phone"
                   class="mt-3 flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                <span class="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <i class="fa-solid fa-phone text-emerald-300 text-sm"></i>
                </span>
                <span class="text-lg font-semibold !text-white tracking-wide">{{ phone }}</span>
              </div>
              <div *ngIf="!c.customer?.phone" class="mt-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/40">
                No phone number on record
              </div>

              <div class="grid grid-cols-2 gap-2 mt-4">
                <button *ngFor="let o of outcomes" (click)="selectOutcome(o.value)"
                        class="px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer text-left"
                        [ngClass]="selectedOutcome === o.value ? '!bg-indigo-500/20 !border-indigo-400/50 !text-white' : 'bg-white/5 border-white/5 !text-white/70 hover:bg-white/10'">
                  {{ o.label }}
                </button>
              </div>

              <div class="mt-4 mb-4">
                <label class="text-xs text-white/50">Next follow-up (optional)</label>
                <input type="date" [(ngModel)]="followUpDate"
                       class="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm !text-white outline-none focus:border-indigo-400/50 [color-scheme:dark]" />
              </div>

              <button (click)="saveOutcome(c)" [disabled]="!selectedOutcome"
                      class="w-full mt-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 !text-white text-sm  transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                Save &amp; Next
              </button>
            </ng-container>

            <!-- Message phase (whatsapp) -->
            <ng-container *ngIf="phase === 'message'">
              <div class="flex items-center gap-2">
                <button (click)="phase = 'view'" class="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer">
                  <i class="fa-solid fa-chevron-left text-xs text-white"></i>
                </button>
                <h3 class="text-lg font-bold !text-white m-0">Compose message</h3>
              </div>

              <p class="text-xs text-white/50 !mt-2 mb-0">{{ c.customer?.name }}</p>

              <!-- Generating -->
              <div *ngIf="generatingMessage" class="py-10 flex flex-col items-center justify-center gap-3">
                <i class="fa-solid fa-spinner fa-spin text-xl text-indigo-400"></i>
                <span class="text-sm text-white/50">Generating message…</span>
              </div>

              <ng-container *ngIf="!generatingMessage">
                <div class="flex items-center justify-between mt-3 mb-2">
                  <span *ngIf="messageGoal" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-500/15 text-indigo-200">
                    {{ messageGoal }}
                  </span>
                  <button (click)="composeMessage(c)" class="ml-auto inline-flex items-center gap-1.5 text-xs !text-white/60 hover:text-white transition-colors cursor-pointer">
                    <i class="fa-solid fa-rotate text-[11px]"></i> Regenerate
                  </button>
                </div>

                <div *ngIf="messageError" class="mb-2 text-xs text-amber-300/90">{{ messageError }}</div>

                <textarea [(ngModel)]="generatedMessage" rows="6"
                          placeholder="Your WhatsApp message…"
                          class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm !text-white outline-none focus:border-indigo-400/50 resize-none leading-relaxed"></textarea>

                <!-- Optional: attach a report (only for WhatsApp / Celebrate; Report flow already sends one) -->
                <label *ngIf="c.actionKey !== 'report'"
                       class="mt-3 flex items-center gap-2.5 cursor-pointer select-none text-sm text-white/70 hover:text-white/90 transition-colors">
                  <input type="checkbox" [(ngModel)]="attachReport"
                         class="w-4 h-4 rounded accent-indigo-500 cursor-pointer" />
                  <span class="inline-flex items-center gap-1.5">
                    <i class="fa-solid fa-chart-column text-[11px] text-indigo-300"></i>
                    Attach report <span class="text-white/40">(optional)</span>
                  </span>
                </label>

                <button (click)="markSent(c)" [disabled]="!generatedMessage.trim()"
                        class="w-full !mt-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 !text-white text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  <i class="fa-brands fa-whatsapp"></i> Mark as Sent &amp; Next
                </button>
              </ng-container>
            </ng-container>
          </div>
        </ng-container>

        <ng-template #done>
          <div class="p-8 text-center">
            <div class="text-4xl">{{ results.length ? '🎉' : '📭' }}</div>
            <h3 class="text-lg font-bold text-violet-400! mt-3 mb-1">{{ results.length ? 'All done!' : 'Nothing to review' }}</h3>
            <p class="text-sm text-white/50 mt-0">
              {{ results.length ? 'You completed ' + results.length + " of today's tasks." : 'There are no customers in this list right now.' }}
            </p>
            <button (click)="close()" class="mt-5 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white! text-sm font-semibold transition-colors cursor-pointer">
              Close
            </button>
          </div>
        </ng-template>
        </ng-container>
      </div>

      <!-- Image zoom view -->
      <div *ngIf="zoomImage" class="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm cursor-zoom-out"
           (click)="closeZoom()">
        <img [src]="zoomImage" alt="" class="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" />
        <button (click)="closeZoom()" class="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Customer configure panel -->
      <app-side-panel [isOpen]="configureOpen" title="Configure Customer" (closePanel)="closeConfigure()">
        <app-customer-configure-panel *ngIf="configureCustomer" [customer]="configureCustomer"
          (customerDeleted)="closeConfigure()"></app-customer-configure-panel>
      </app-side-panel>
    </div>
  `
})
export class ActionRunnerComponent implements OnChanges, OnDestroy {
  @Input() open = false;
  @Input() startAction: ActionKey | null = null;
  @Output() openChange = new EventEmitter<boolean>();

  queue: QueueItem[] = [];
  index = 0;
  phase: 'view' | 'outcome' | 'message' = 'view';
  selectedOutcome: CallOutcome | null = null;
  followUpDate = '';
  // WhatsApp message composer (LLM-generated, editable):
  generatingMessage = false;
  generatedMessage = '';
  messageGoal = '';
  messageError = '';
  // Optional "attach report" toggle shown in the WhatsApp / Celebrate message
  // flows. When checked, sending routes through the Send Report dialog flow.
  attachReport = false;
  results: any[] = [];
  loading = false;        // fetching the very first record list (queue still empty)
  loadingRecords = false; // fetching a record list page (initial or subsequent)
  zoomImage: string | null = null; // enlarged avatar shown in the zoom overlay
  configureOpen = false;
  configureCustomer: any = null;

  private dashboardService = inject(DashboardService);
  private orgService = inject(OrganizationServiceService);
  private dialog = inject(MatDialog);
  private sub = new Subscription();

  // Which actions this run should process. Start Brief → all four in priority
  // order; a single action button → just that one.
  private actionsToRun: ActionKey[] = [];

  // Where the next record-list fetch should read from: which action (index into
  // actionsToRun) and which page of that action's status. We finish one status
  // (all its pages) before moving on to the next.
  private loadCursor = { actionIdx: 0, nextPage: 0 };

  outcomes: { value: CallOutcome; label: string }[] = [
    { value: 'CONTACTED', label: 'Contacted' },
    { value: 'NO_RESPONSE', label: 'No Response' },
    { value: 'WILL_RETURN', label: 'Will Return' },
    { value: 'TRAVELLING', label: 'Travelling' },
    { value: 'SICK', label: 'Sick' },
    { value: 'FINANCIAL_ISSUE', label: 'Financial Issue' },
    { value: 'SWITCHED_PROVIDER', label: 'Switched Provider' },
    { value: 'NOT_INTERESTED', label: 'Not Interested' },
    { value: 'OTHER', label: 'Other' },
    { value: 'DND', label: "Don't Disturb" }
  ];

  // Days to add to today for the next follow-up, per outcome. DND has no next
  // follow-up (the doNotDisturb flag suppresses further contact instead).
  private followUpOffsetDays: Record<CallOutcome, number | null> = {
    CONTACTED: 3,
    NO_RESPONSE: 2,
    WILL_RETURN: 7,
    TRAVELLING: 14,
    SICK: 14,
    FINANCIAL_ISSUE: 30,
    SWITCHED_PROVIDER: 90,
    NOT_INTERESTED: 60,
    OTHER: 7,
    DND: null
  };

  // Action → health-status bucket. Priority order is Call → WhatsApp → Report →
  // Celebrate (i.e. CRITICAL → NEEDS_ATTENTION → WATCH → HEALTHY).
  private actionOrder: ActionKey[] = ['call', 'whatsapp', 'report', 'celebrate'];
  private actionToStatus: Record<ActionKey, HealthStatus> = {
    call: 'CRITICAL',
    whatsapp: 'NEEDS_ATTENTION',
    report: 'WATCH',
    celebrate: 'HEALTHY'
  };

  private readonly pageSize = 20;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open'] && this.open) {
      this.start();
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  start() {
    // Reset any in-flight work from a previous open.
    this.sub.unsubscribe();
    this.sub = new Subscription();

    this.queue = [];
    this.index = 0;
    this.results = [];
    this.resetStep();

    // Start Brief (no startAction) processes every status in priority order;
    // a single action button processes only its status.
    this.actionsToRun = this.startAction ? [this.startAction] : [...this.actionOrder];
    this.loadCursor = { actionIdx: 0, nextPage: 0 };

    this.loading = true;
    this.fetchNextBatch(() => {
      this.loading = false;
      this.afterCurrentChange();
    });
  }

  // Fetch the next record-list page pointed at by loadCursor and append the
  // records to the queue (customer details are NOT fetched here — they are
  // resolved lazily per card). Skips empty statuses so the user always lands on
  // real work. Only the lightweight record list is fetched per call.
  private fetchNextBatch(onDone?: () => void) {
    if (this.loadCursor.actionIdx >= this.actionsToRun.length) {
      onDone?.();
      return;
    }
    const key = this.actionsToRun[this.loadCursor.actionIdx];
    const status = this.actionToStatus[key];
    const page = this.loadCursor.nextPage;
    this.loadingRecords = true;

    const s = this.dashboardService.getHealthStatusPage(status, page, this.pageSize).subscribe({
      next: (res) => {
        const records = res?.content || [];
        const totalPages = res?.totalPages ?? 1;

        for (const rec of records) {
          this.queue.push({ actionKey: key, record: rec, customer: null });
        }

        // Advance the cursor: next page of the same status, or on to the next.
        if (page + 1 < totalPages) {
          this.loadCursor = { actionIdx: this.loadCursor.actionIdx, nextPage: page + 1 };
        } else {
          this.loadCursor = { actionIdx: this.loadCursor.actionIdx + 1, nextPage: 0 };
        }

        // Empty page/status — keep pulling until we find records or run out.
        if (!records.length) {
          this.fetchNextBatch(onDone);
          return;
        }
        this.loadingRecords = false;
        onDone?.();
      },
      error: (err) => {
        console.error('Error fetching health status page', status, err);
        // Skip the failed status and try the next one.
        this.loadCursor = { actionIdx: this.loadCursor.actionIdx + 1, nextPage: 0 };
        this.fetchNextBatch(onDone);
      }
    });
    this.sub.add(s);
  }

  // Lazily fetch customer details for a single queue item — only when it is
  // shown. Called on start and whenever the user advances (skip / complete).
  private ensureCustomer(item: QueueItem | null) {
    if (!item || item.customer || item.loadingCustomer) return;
    item.loadingCustomer = true;
    const status = this.actionToStatus[item.actionKey];
    const s = this.orgService.getCustomerProgress(item.record.customerId).pipe(
      map(res => this.toRunnerCustomer(status, item.record, res?.data)),
      catchError(() => of(this.toRunnerCustomer(status, item.record, null)))
    ).subscribe(cust => {
      item.customer = cust;
      item.loadingCustomer = false;
    });
    this.sub.add(s);
  }

  // Build a RunnerCustomer from the customer-progress payload. Customer identity
  // (name/phone/photo) lives under data.customerDTO; the attendance data driving
  // the heatmap and duration chart is on the root payload.
  private toRunnerCustomer(status: HealthStatus, rec: HealthStatusRecord, p: any): RunnerCustomer {
    const data = p || {};
    const dto = data.customerDTO || {};
    const name = `${dto.firstName || ''} ${dto.lastName || ''}`.trim()
      || dto.customerName || dto.name || `Customer #${rec.customerId}`;

    const durations = this.getDurations(data);
    const allMonths = this.buildHeatmap(data);

    return {
      customerId: rec.customerId,
      name,
      phone: dto.contactNumber || dto.phone || '',
      photoUrl: dto.photoUrl || dto.documentDto?.attachments?.[0]?.url || '',
      health: this.mapHealthLabel(status),
      healthScore: rec.healthScore,
      membershipName: data.membershipName || data.planName || data.membershipPlanName
        || dto.membershipName || dto.planName || '',
      reasons: this.buildReasons(rec.features || []),
      expectedRecovery: rec.revenueRisk || 0,
      totalVisits: this.getTotalVisits(data),
      streak: data.streak || 0,
      remainingDays: data.remainingDays || 0,
      averageDuration: this.getAverageDuration(durations),
      longestDuration: this.getLongestDuration(durations),
      shortestDuration: this.getShortestDuration(durations),
      heatmapData: allMonths.slice(-3), // compact card: last 3 months only
      growth: this.getAttendanceGrowth(allMonths),
      attendanceByWeek: this.getWeeklyAttendance(data),
      dto: { ...dto, id: dto.id ?? rec.customerId }
    };
  }

  // Group weeklyAttendance into weeks (Sunday-start): visits + avg duration.
  private getWeeklyAttendance(p: any): WeeklyAttendance[] {
    const data = this.weeklyAttendance(p);
    const weeks: Record<string, { visits: number; totalDuration: number; durCount: number }> = {};

    Object.entries(data).forEach(([date, day]: [string, any]) => {
      const d = new Date(date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay()); // back to Sunday
      const key = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;

      if (!weeks[key]) weeks[key] = { visits: 0, totalDuration: 0, durCount: 0 };
      if (day?.checkInAt) weeks[key].visits++;
      if (day?.checkInAt && day?.checkOutAt) {
        const mins = (new Date(day.checkOutAt).getTime() - new Date(day.checkInAt).getTime()) / (1000 * 60);
        if (mins > 0) {
          weeks[key].totalDuration += mins;
          weeks[key].durCount++;
        }
      }
    });

    return Object.keys(weeks).sort().map(key => ({
      weekStart: key,
      visits: weeks[key].visits,
      avgDuration: weeks[key].durCount ? Math.round(weeks[key].totalDuration / weeks[key].durCount) : 0
    }));
  }

  // ── Workout progress helpers (ported from CustomersActionsComponent) ──

  private weeklyAttendance(p: any): Record<string, any> {
    return p?.weeklyAttendance || {};
  }

  private getDurations(p: any): number[] {
    const durations: number[] = [];
    Object.values(this.weeklyAttendance(p)).forEach((day: any) => {
      if (day?.checkInAt && day?.checkOutAt) {
        const mins = (new Date(day.checkOutAt).getTime() - new Date(day.checkInAt).getTime()) / (1000 * 60);
        if (mins > 0) durations.push(mins);
      }
    });
    return durations;
  }

  private getTotalVisits(p: any): number {
    return Object.values(this.weeklyAttendance(p)).filter((d: any) => d?.checkOutAt).length;
  }

  private getAverageDuration(durations: number[]): number {
    if (!durations.length) return 0;
    return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  }

  private getLongestDuration(durations: number[]): number {
    return durations.length ? Math.round(Math.max(...durations)) : 0;
  }

  private getShortestDuration(durations: number[]): number {
    return durations.length ? Math.round(Math.min(...durations)) : 0;
  }

  private getIntensityLevel(duration: number): number {
    if (duration === 0) return 0; // no visit
    if (duration < 30) return 1;  // low
    if (duration < 90) return 2;  // medium
    return 3;                     // high
  }

  // Group attendance by "YYYY-M" (0-based month), then build a padded heatmap
  // grid per month, oldest → newest.
  private buildHeatmap(p: any): HeatmapMonth[] {
    const data = this.weeklyAttendance(p);
    if (!Object.keys(data).length) return [];

    const grouped: Record<string, Record<string, any>> = {};
    Object.entries(data).forEach(([date, value]) => {
      const d = new Date(date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!grouped[key]) grouped[key] = {};
      grouped[key][date] = value;
    });

    const monthKeys = Object.keys(grouped).sort((a, b) => {
      const [ya, ma] = a.split('-').map(Number);
      const [yb, mb] = b.split('-').map(Number);
      return new Date(ya, ma).getTime() - new Date(yb, mb).getTime();
    });

    return monthKeys.map(key => {
      const days = this.buildMonthGrid(key, grouped[key]);
      return { heatmapData: days, monthLabel: this.monthLabelFor(days) };
    });
  }

  private buildMonthGrid(monthKey: string, monthData: Record<string, any>): HeatmapDay[] {
    const [year, month] = monthKey.split('-').map(Number);
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const padding = firstDayOfMonth.getDay(); // 0 = Sunday
    const now = new Date();
    const result: HeatmapDay[] = [];

    for (let i = 0; i < padding; i++) {
      result.push({ duration: 0, level: 0, empty: true, future: false });
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const attendance = monthData[dateStr] || {};

      let duration = 0;
      if (attendance.checkInAt && attendance.checkOutAt) {
        duration = Math.max((new Date(attendance.checkOutAt).getTime() - new Date(attendance.checkInAt).getTime()) / (1000 * 60), 0);
      }

      result.push({
        date: dateStr,
        duration,
        future: new Date(year, month, day) > now,
        level: this.getIntensityLevel(duration),
        empty: false
      });
    }

    return result;
  }

  private monthLabelFor(days: HeatmapDay[]): string {
    const first = days.find(d => !d.empty && d.date);
    if (!first?.date) return '';
    return new Date(first.date).toLocaleString('default', { month: 'short', year: 'numeric' });
  }

  private getTotalMinutes(days: HeatmapDay[]): number {
    return days.reduce((sum, d) => sum + d.duration, 0);
  }

  // Month-over-month growth using the two oldest months (faithful port).
  private getAttendanceGrowth(months: HeatmapMonth[]): number {
    if (!months || months.length < 2) return 0;
    const prevTotal = this.getTotalMinutes(months[0].heatmapData);
    const currTotal = this.getTotalMinutes(months[1].heatmapData);
    if (prevTotal === 0) return currTotal > 0 ? 100 : 0;
    return Number((((currTotal - prevTotal) / prevTotal) * 100).toFixed(1));
  }

  // UI health badge only distinguishes Critical / At Risk / Healthy.
  private mapHealthLabel(status: HealthStatus): RunnerCustomer['health'] {
    if (status === 'CRITICAL') return 'Critical';
    if (status === 'HEALTHY') return 'Healthy';
    return 'At Risk'; // WATCH + NEEDS_ATTENTION
  }

  // Turn raw feature signals into human-readable bullet points.
  private buildReasons(features: HealthFeature[]): string[] {
    const reasons: string[] = [];
    for (const f of features) {
      const n = f.numericValue;
      switch (f.featureKey) {
        case 'days_since_last_visit':
          // 9999 is a sentinel for "no visit on record" — skip it entirely.
          if (n != null && n < 9999) reasons.push(n === 0 ? 'Visited today' : `Last visited ${n} day${n === 1 ? '' : 's'} ago`);
          break;
        case 'visits_last_30_days':
          if (n != null) reasons.push(`${n} visit${n === 1 ? '' : 's'} in last 30 days`);
          break;
        case 'visit_trend':
          if (n != null) reasons.push(`Visit trend: ${n > 0 ? '+' : ''}${n}`);
          break;
        case 'workout_completion_rate':
          if (n != null) reasons.push(`Workout completion: ${Math.round(n <= 1 ? n * 100 : n)}%`);
          break;
        case 'days_to_expiry':
          if (n != null) reasons.push(`Membership expires in ${n} day${n === 1 ? '' : 's'}`);
          break;
        case 'renewal_count':
          if (n != null) reasons.push(n === 0 ? 'Never renewed' : `Renewed ${n} time${n === 1 ? '' : 's'}`);
          break;
      }
    }
    return reasons;
  }

  // Run whenever the shown card changes (start / advance): lazily load the
  // current customer's details, and prefetch the next record batch (next page,
  // or next status) once the user reaches the last loaded record.
  private afterCurrentChange() {
    this.ensureCustomer(this.current);
    const moreToLoad = this.loadCursor.actionIdx < this.actionsToRun.length;
    if (moreToLoad && !this.loadingRecords && this.index >= this.queue.length - 1) {
      // The newly appended item may now be the current card (if the user
      // advanced past the last loaded one) — resolve its details on arrival.
      this.fetchNextBatch(() => this.ensureCustomer(this.current));
    }
  }

  initials(name: string): string {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  openZoom(url: string) {
    this.zoomImage = url;
  }

  closeZoom() {
    this.zoomImage = null;
  }

  openConfigure(cust: RunnerCustomer) {
    this.configureCustomer = cust.dto;
    this.configureOpen = true;
  }

  closeConfigure() {
    this.configureOpen = false;
    this.configureCustomer = null;
  }

  get current(): QueueItem | null {
    return this.queue[this.index] || null;
  }

  // Full-panel spinner: initial fetch, or waiting on a record batch with
  // nothing to show yet (e.g. advanced past the last loaded item).
  get showSpinner(): boolean {
    return this.loading || (this.loadingRecords && !this.current);
  }

  get progress(): number {
    return this.queue.length ? (this.index / this.queue.length) * 100 : 0;
  }

  get positionLabel(): string {
    const c = this.current;
    if (!c) return '';
    const same = this.queue.filter(q => q.actionKey === c.actionKey);
    return `${same.indexOf(c) + 1} / ${same.length}`;
  }

  headerFor(key: ActionKey): string {
    return {
      call: '📞 CALL',
      whatsapp: '💬 WHATSAPP',
      report: '📊 SEND REPORT',
      celebrate: '🎉 CELEBRATE'
    }[key];
  }

  primaryLabel(key: ActionKey): string {
    return {
      call: 'Call',
      whatsapp: 'Send WhatsApp',
      report: 'Send Report',
      celebrate: 'Send Wish'
    }[key];
  }

  primaryIcon(key: ActionKey): string {
    return {
      call: 'fa-solid fa-phone',
      whatsapp: 'fa-brands fa-whatsapp',
      report: 'fa-solid fa-chart-column',
      celebrate: 'fa-solid fa-gift'
    }[key];
  }

  healthClass(health: RunnerCustomer['health']): string {
    return {
      Critical: 'bg-red-500/15 text-red-300',
      'At Risk': 'bg-amber-500/15 text-amber-300',
      Healthy: 'bg-emerald-500/15 text-emerald-300'
    }[health];
  }

  primary(item: QueueItem) {
    if (item.actionKey === 'call') {
      this.phase = 'outcome';
    } else if (item.actionKey === 'whatsapp') {
      // Generate a WhatsApp message with the LLM, then let the user edit & send.
      this.phase = 'message';
      this.composeMessage(item);
    } else if (item.actionKey === 'report') {
      // Report also triggers a message generation flow.
      this.phase = 'message';
      this.composeMessage(item);
    } else if (item.actionKey === 'celebrate') {
      // Celebrate also triggers a WhatsApp message flow.
      this.phase = 'message';
      this.composeMessage(item);
    } else {
      // Other action types just record & advance for now.
      this.record(item, 'DONE');
      this.advance();
    }
  }

  // Ask the LLM to draft a WhatsApp message from the customer's engagement data.
  composeMessage(item: QueueItem) {
    this.generatingMessage = true;
    this.messageError = '';
    this.generatedMessage = '';
    this.messageGoal = '';

    const prompt = this.buildWhatsappPrompt(item);
    const s = this.orgService.generateContentVertex(prompt, 200).subscribe({
      next: (res: any) => {
        // Payload may sit under `data` or be the response body itself.
        const parsed = this.parseLlmMessage(res?.data ?? res);
        this.generatedMessage = parsed.message;
        this.messageGoal = parsed.goal;
        this.generatingMessage = false;
        if (!parsed.message) {
          this.messageError = 'Could not read a message from the response. You can type one manually.';
        }
      },
      error: (err) => {
        console.error('Error generating WhatsApp message', err);
        this.generatingMessage = false;
        this.messageError = 'Failed to generate the message. Try again or type one manually.';
      }
    });
    this.sub.add(s);
  }

  // Open the WhatsApp chat with the drafted message, then ask whether to set a
  // follow-up before moving on.
  async markSent(item: QueueItem) {
    const message = this.generatedMessage.trim();
    if (!message) return;

    // Default follow-up date: 1 week from today (YYYY-MM-DD).
    const oneWeekFromNow = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().slice(0, 10);
    })();

    if (item.actionKey === 'report' || this.attachReport) {
      // Send Report flow (or an "Attach report" opt-in from WhatsApp /
      // Celebrate): open the CustomersActionsComponent dialog with the
      // generated message pre-filled so the user can share the report card
      // via WhatsApp using that message.
      const dialogRef = this.dialog.open(CustomersActionsComponent, {
        width: '1100px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        data: { customer: item.customer?.dto, initialMessage: message }
      });

      // After the dialog closes, ask for a follow-up date (Skip / Update)
      // before recording and moving to the next customer.
      dialogRef.afterClosed().subscribe(async () => {
        const res = await Swal.fire({
          title: 'Update follow-up',
          input: 'date',
          inputLabel: 'Next follow-up date',
          inputValue: oneWeekFromNow,
          showCancelButton: true,
          confirmButtonText: 'Update',
          cancelButtonText: 'Skip',
          background: '#18181b',
          color: '#ffffff',
          confirmButtonColor: '#6366f1',
          cancelButtonColor: '#3f3f46'
        });

        const followUp = res.isConfirmed && res.value ? res.value : undefined;
        this.record(item, 'SENT', followUp, message, res.isConfirmed);
        this.advance();
      });
      return;
    }

    this.openWhatsapp(item.customer?.phone, message);

    const res = await Swal.fire({
      title: 'Update follow-up',
      input: 'date',
      inputLabel: 'Next follow-up date',
      inputValue: oneWeekFromNow,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Skip',
      background: '#18181b',
      color: '#ffffff',
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#3f3f46'
    });

    const followUp = res.isConfirmed && res.value ? res.value : undefined;
    this.record(item, 'SENT', followUp, message, res.isConfirmed);
    this.advance();
  }

  private openWhatsapp(phone: string | undefined, message: string) {
    const digits = (phone || '').replace(/[^\d]/g, '');
    const shopName = localStorage.getItem("shopName") || '';
    const fullMessage = `${message}` +
      (shopName ? `\n– ${shopName}` : '') +
      `\n\nDownload our app: ${environment.appDownloadUrl}\n` +
      `Note: Use the same email & phone number you gave at the gym to access your existing membership.`;
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(fullMessage)}`;
    window.open(url, '_blank');
  }

  private buildWhatsappPrompt(item: QueueItem): string {
    const rec = item.record;
    const name = item.customer?.name?.trim() || 'Unknown';

    const f = (key: string): number | string => {
      const feat = rec.features?.find(x => x.featureKey === key);
      return feat?.numericValue ?? 'Unknown';
    };

    const weeks = item.customer?.attendanceByWeek || [];

    const weeklyLines = weeks.length
      ? weeks.map(w =>
        `- Week of ${w.weekStart}: ${w.visits} visit${w.visits === 1 ? '' : 's'}${w.avgDuration ? `, avg ${w.avgDuration} mins` : ''}`
      ).join('\n')
      : '- No attendance recorded';

    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return `You are an AI fitness coach communicating with gym members through WhatsApp.

Your personality:
- You are a real fitness coach, not a CRM bot.
- Warm, charismatic, positive and human.
- Encourage customers like a coach who knows their journey.
- Motivate without guilt or pressure.
- Make every message feel personally written.
- Be optimistic but always truthful.

IMPORTANT:
Never exaggerate customer progress.
Never praise achievements that are not supported by the data.

Customer Data:
- Today's Date: ${today}
- Customer Name: ${name}
- Days Since Last Visit: ${f('days_since_last_visit')}
- Visits Last 30 Days: ${f('visits_last_30_days')}
- Visits Previous 30 Days: ${f('visits_previous_30_days')}
- Visit Trend: ${f('visit_trend')}
- Workout Completion Rate: ${f('workout_completion_rate')}
- Days Until Membership Expiry: ${f('days_to_expiry')}
- Renewal Count: ${f('renewal_count')}

Weekly Attendance:
${weeklyLines}


GOAL SELECTION (follow priority order):

1. If Days Until Membership Expiry <= 30:
   Choose RENEWAL.

   Renewal message rules:
   - If attendance is strong:
     Celebrate their consistency and encourage continuation.
   - If attendance is weak:
     Do NOT pretend they achieved great results.
     Encourage them to make the next phase count.
   - Never sound like a payment reminder.
   - Never mention price, offers, discounts, or plans.

2. Else if Days Since Last Visit >= 15:
   Choose REACTIVATION.

3. Else if Visits Last 30 Days >= 12:
   Choose CONSISTENCY or APPRECIATION.

4. Else if customer needs workout guidance:
   Choose WORKOUT_SUPPORT.

5. Otherwise:
   Choose ENGAGEMENT.


CUSTOMER ACTIVITY INTERPRETATION:

0-3 days since last visit:
- Customer is active.
- Never mention absence.
- Never say "we miss you".
- Encourage maintaining their routine.

4-7 days since last visit:
- Customer is slightly inactive.
- Encourage them gently.
- Do not make them feel guilty.
- Do not say "we haven't seen you".

8-14 days since last visit:
- Encourage restarting.
- Normalize breaks.
- Focus on the next workout.

15+ days since last visit:
- Welcome them back.
- Encourage taking the first step again.


REALITY-BASED COACHING:

If attendance is high:
Use:
- Celebrate discipline
- Celebrate routine
- Celebrate consistency

If attendance is average:
Use:
- Encourage building habits
- Encourage staying regular
- Appreciate effort

If attendance is low:
Use:
- Encourage starting again
- Focus on small wins
- Build confidence

Never say:

- "Amazing commitment"
- "Great consistency"
- "You are doing fantastic"
- "Your progress is impressive"
- "You've been crushing it"

unless the data clearly supports it.


MESSAGE STYLE:

Write only 2-3 short WhatsApp sentences.

Structure:
1. Friendly personal opening.
2. Honest encouragement based on their journey.
3. Positive next action.

Messages should make customers feel:
- Supported
- Motivated
- Confident
- Valued


Avoid repetitive AI phrases:

Do not repeatedly use:
- Keep the momentum going
- Consistency is key
- Every workout counts
- You're doing great
- Keep pushing
- Stay strong
- One step closer

Create fresh wording every time.

Never mention:
- Health score
- Health status
- Risk
- Revenue risk
- Churn
- Analytics
- Tracking
- Internal metrics


Never:
- Shame the customer
- Create urgency unnecessarily
- Sell aggressively
- Add emoji in msg


Return only valid JSON.
No markdown.
No code fences.

Output:
{
 "goal":"GOAL",
 "reason":"Brief internal reason",
 "message":"Customer-facing WhatsApp message"
}`;
  }

  // The LLM is asked for raw JSON, but tolerate markdown fences / surrounding
  // text and object-wrapped responses.
  private parseLlmMessage(data: any): { goal: string; message: string } {
    let raw = data;
    if (raw && typeof raw === 'object' && !raw.message
      && (raw.generatedText || raw.text || raw.content || raw.output)) {
      raw = raw.generatedText || raw.text || raw.content || raw.output;
    }
    if (raw && typeof raw === 'object') {
      return { goal: raw.goal || '', message: raw.message || '' };
    }
    if (typeof raw === 'string') {
      const text = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
      let obj: any = null;
      try {
        obj = JSON.parse(text);
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          try { obj = JSON.parse(match[0]); } catch { /* ignore */ }
        }
      }
      if (obj && typeof obj === 'object') {
        return { goal: obj.goal || '', message: obj.message || '' };
      }
      return { goal: '', message: text };
    }
    return { goal: '', message: '' };
  }


  skip() {
    const c = this.current;
    if (c) this.record(c, 'SKIPPED');
    this.advance();
  }

  // Select a call outcome and auto-fill the next follow-up date based on the
  // outcome's offset. The user can still override the date afterwards.
  selectOutcome(outcome: CallOutcome) {
    this.selectedOutcome = outcome;
    const offset = this.followUpOffsetDays[outcome];
    if (offset != null) {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      this.followUpDate = d.toISOString().slice(0, 10);
    } else {
      // DND — no next follow-up.
      this.followUpDate = '';
    }
  }

  saveOutcome(item: QueueItem) {
    if (!this.selectedOutcome) return;
    this.record(item, this.selectedOutcome, this.followUpDate);
    this.advance();
  }

  private record(item: QueueItem, outcome: string, followUp?: string, message?: string, saveFollowUp: boolean = true) {
    const entry = {
      action: item.actionKey,
      customerId: item.record.customerId,
      customer: item.customer?.name,
      outcome,
      message: message || null,
      nextFollowUp: followUp || null
    };
    this.results.push(entry);

    // Skipped cards aren't a contact — nothing to log.
    if (outcome === 'SKIPPED') return;

    // User skipped the "next follow-up" prompt — don't hit the follow-up API.
    if (!saveFollowUp) return;

    // Our use case only logs CALL and WHATSAPP follow-ups. A phone call maps to
    // CALL; everything that sends a WhatsApp message (whatsapp / report /
    // celebrate) maps to WHATSAPP. The notes carry what we actually sent (the
    // message) or, for a call, the outcome we logged.
    const actionType: FollowUpActionType = item.actionKey === 'call' ? 'CALL' : 'WHATSAPP';
    const notes = actionType === 'CALL'
      ? `${this.outcomeLabel(outcome)}`
      : (message?.trim() || 'Sent WhatsApp message.');

    const today = new Date().toISOString().slice(0, 10);
    // Calls also carry the follow-up outcome; DND additionally sets the
    // doNotDisturb flag so the backend suppresses further contact.
    const callFields = actionType === 'CALL'
      ? { outcome, doNotDisturb: outcome === 'DND' }
      : {};
    const s = this.dashboardService.createFollowUp({
      customerId: item.record.customerId,
      actionType,
      notes,
      followUpDate: today,
      nextFollowUpDate: followUp || null,
      ...callFields
    }).subscribe({
      error: (err) => console.error('Error saving follow-up', err)
    });
    this.sub.add(s);
  }

  // Human-readable label for a logged call outcome (falls back to the raw value).
  private outcomeLabel(outcome: string): string {
    return this.outcomes.find(o => o.value === outcome)?.label || outcome;
  }

  private advance() {
    this.index++;
    this.resetStep();
    this.afterCurrentChange();
  }

  private resetStep() {
    this.phase = 'view';
    this.selectedOutcome = null;
    this.followUpDate = '';
    this.generatingMessage = false;
    this.generatedMessage = '';
    this.messageGoal = '';
    this.messageError = '';
    this.attachReport = false;
  }

  close() {
    this.open = false;
    this.openChange.emit(false);
  }
}
