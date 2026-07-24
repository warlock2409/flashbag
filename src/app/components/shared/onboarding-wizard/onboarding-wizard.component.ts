import { Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

interface Option {
  key: string;
  icon?: string;
  title?: string;
  label?: string;
  desc: string;
}

interface BmiCategory {
  key: string;
  min: number;
  max: number;
  label: string;
  currentType: string;   // body-type key for the current physique
  targetType: string;    // body-type key for the goal physique
  recommendedGoal: string;
}

const IMAGE_BASE = 'https://pub-f3cc65a63e2a4ca88e58aae1aedfa9f6.r2.dev/';

// Each body type has a female and male illustration (filenames differ).
const BODY_IMAGES: Record<string, { female: string; male: string }> = {
  lean:       { female: 'f0_lean_nbg.png',         male: 'm0_lean_nbg.png' },
  muscular:   { female: 'f1_muscular_nbg.png',     male: 'm1_muscular_nbg.png' },
  extra_muscular:  {female: 'f2_a_a_ngb.png',           male: 'm1_muscular_nbg.png'},
  athletic:   { female: 'f2_Athletic_nbg.png',     male: 'm2_athletic_nbg.png' },
  average:    { female: 'f3_average_nbg.png',      male: 'm3_average_nbg.png' },
  overweight: { female: 'f4_overweight_nbg.png',   male: 'm4_obease_nbg.png' },
  superObese: { female: 'f5_super_obease_nbg.png', male: 'm5_super_obease_nbg.png' },
};


const BMI_CATEGORIES: BmiCategory[] = [
  { key: 'VERY_LEAN',      min: 0,    max: 18.5,                    label: 'Very Lean',      currentType: 'lean',       targetType: 'muscular', recommendedGoal: 'Build Muscle' },
  { key: 'LEAN',           min: 18.5, max: 21,                      label: 'Lean',           currentType: 'lean',       targetType: 'extra_muscular', recommendedGoal: 'Build Muscle' },
  { key: 'ATHLETIC',       min: 21,   max: 24,                      label: 'Athletic',       currentType: 'athletic',   targetType: 'extra_muscular', recommendedGoal: 'Maintain Fitness' },
  { key: 'AVERAGE',        min: 24,   max: 27,                      label: 'Average',        currentType: 'average',    targetType: 'athletic', recommendedGoal: 'Lose Weight' },
  { key: 'OVERWEIGHT',     min: 27,   max: 30,                      label: 'Overweight',     currentType: 'overweight', targetType: 'athletic', recommendedGoal: 'Lose Weight' },
  { key: 'OBESE',          min: 30,   max: 35,                      label: 'Obese',          currentType: 'superObese', targetType: 'athletic', recommendedGoal: 'Lose Weight' },
  { key: 'SEVERE_OBESITY', min: 35,   max: Number.MAX_SAFE_INTEGER, label: 'Severe Obesity', currentType: 'superObese', targetType: 'athletic', recommendedGoal: 'Lose Weight' },
];

/** Resolve a body-type image URL for the given gender (defaults to female). */
function bodyImage(type: string, gender: string | null | undefined): string {
  const set = BODY_IMAGES[type];
  if (!set) return '';
  const key = (gender || '').toLowerCase() === 'male' ? 'male' : 'female';
  return IMAGE_BASE + set[key];
}

/** Parse a DD/MM/YYYY string into a Date, or null if invalid. */
function parseDob(value: string | null | undefined): Date | null {
  if (!value) return null;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!m) return null;
  const day = +m[1], month = +m[2], year = +m[3];
  const d = new Date(year, month - 1, day);
  // Reject impossible dates (e.g. 31/02) that JS would roll over.
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

/** Validator for a DD/MM/YYYY date of birth: valid, not in the future, after 1900. */
function dobValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null; // `required` handles emptiness
  const d = parseDob(control.value);
  if (!d || d.getTime() > Date.now() || d.getFullYear() < 1900) return { dob: true };
  return null;
}


interface GoalPlan {
  direction: 'lose' | 'gain';
  ratePerMonth: number;   // average kg changed per month (used as the divisor)
  rateLabel: string;      // human-readable expected rate
  targetBmi: number;      // BMI we aim the target weight at
  actionVerb: string;     // 'lose' | 'gain' — used in "Weight to …"
  transformations: string[];
}

// Rates below reflect commonly cited, sustainable guidance:
//  - Fat loss ~0.5–1 kg/week (2–4 kg/month), avg ~3.
//  - Natural muscle gain ~0.5–1 kg/month, avg ~0.75.
//  - Event prep leans down at a slightly more conservative 2–3 kg/month.
//  - Health/diabetes management targets a gentler 1–2 kg/month, ~5–10% body weight.
const GOAL_PLANS: Record<string, GoalPlan> = {
  LOSE_WEIGHT: {
    direction: 'lose',
    ratePerMonth: 3,
    rateLabel: '2–4 kg / month',
    targetBmi: 23,
    actionVerb: 'lose',
    transformations: ['Lose fat', 'Reduce waist size', 'Improve energy', 'Build sustainable eating habits'],
  },
  BUILD_MUSCLE: {
    direction: 'gain',
    ratePerMonth: 0.75,
    rateLabel: '0.5–1 kg / month',
    targetBmi: 23.5,
    actionVerb: 'gain',
    transformations: ['Build lean muscle', 'Increase strength', 'Improve posture & shape', 'Boost metabolism'],
  },
  EVENT: {
    direction: 'lose',
    ratePerMonth: 2.5,
    rateLabel: '2–3 kg / month',
    targetBmi: 22,
    actionVerb: 'lose',
    transformations: ['Get photo-ready', 'Define muscle tone', 'Reduce body fat', 'Peak on your event day'],
  },
  HEALTH: {
    direction: 'lose',
    ratePerMonth: 2,
    rateLabel: '1–2 kg / month',
    targetBmi: 24,
    actionVerb: 'lose',
    transformations: ['Improve blood sugar control', 'Lower blood pressure', 'Increase daily energy', 'Build lasting healthy habits'],
  },
};

@Component({
  selector: 'app-onboarding-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="onboarding-container bg-white text-zinc-900 rounded-2xl shadow-2xl w-full mx-auto overflow-hidden flex flex-col max-h-[90vh]">

      <!-- Progress header -->
      <div class="px-6 sm:px-8 pt-6 shrink-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-1.5 h-4 bg-violet-500 rounded-full"></span>
          <span class="text-[11px] font-semibold uppercase tracking-wide text-violet-600">Step {{ step }} of {{ totalSteps }}</span>
        </div>
        <div class="flex gap-1.5 mt-3">
          <div *ngFor="let s of steps"
               class="h-1 flex-1 rounded-full transition-colors duration-300"
               [ngClass]="s <= step ? 'bg-violet-500' : 'bg-zinc-200'"></div>
        </div>
      </div>

      <div class="p-6 sm:p-8 flex-1 overflow-y-auto min-h-0">

        <!-- ===== STEP 1: Fitness goal ===== -->
        <ng-container *ngIf="step === 1">
          <h2 class="text-xl sm:text-2xl font-semibold tracking-tight !mb-1 !text-zinc-900">What would you like to achieve?</h2>
          <p class="text-zinc-500 text-xs sm:text-sm mb-6">Tell us your goal, and we'll create a personalized transformation plan for you.</p>

          <div class="grid grid-cols-1 gap-3">
            <button type="button" *ngFor="let g of goals" (click)="selectGoal(g.key)"
              class="text-left rounded-xl border p-4 flex items-start gap-3 transition-all hover:border-violet-300"
              [ngClass]="selectedGoal === g.key ? 'border-violet-500 ring-2 ring-violet-500/20 bg-violet-50/50' : 'border-zinc-200'">
              <span class="text-2xl leading-none">{{ g.icon }}</span>
              <span class="flex-1">
                <span class="block text-sm font-semibold text-zinc-900">{{ g.title }}</span>
                <span class="block text-xs text-zinc-500 mt-0.5">{{ g.desc }}</span>
              </span>
              <span class="mt-1 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                [ngClass]="selectedGoal === g.key ? 'border-violet-500 bg-violet-500' : 'border-zinc-300'">
                <span *ngIf="selectedGoal === g.key" class="w-1.5 h-1.5 rounded-full bg-white"></span>
              </span>
            </button>
          </div>
        </ng-container>

        <!-- ===== STEP 2: About you ===== -->
        <ng-container *ngIf="step === 2">
          <h2 class="text-xl sm:text-2xl font-semibold tracking-tight mb-1 !text-zinc-900">Let's get to know you</h2>
          <p class="text-zinc-500 text-xs sm:text-sm mb-6">These details help us understand your starting point and recommend the right plan.</p>

          <form [formGroup]="aboutForm" class="space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-zinc-500 px-1">Height (cm)</label>
                <input formControlName="height" type="number" placeholder="170"
                  class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all">
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-zinc-500 px-1">Weight (kg)</label>
                <input formControlName="weight" type="number" placeholder="65"
                  class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all">
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-zinc-500 px-1">
                Date of birth
                <span *ngIf="age !== null" class="text-violet-600">· {{ age }} yrs</span>
              </label>
              <input formControlName="dob" type="text" inputmode="numeric" maxlength="10"
                placeholder="DD/MM/YYYY" (input)="onDobInput($event)"
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all">
              <span class="text-[10px] text-rose-500 px-1"
                *ngIf="aboutForm.get('dob')?.touched && aboutForm.get('dob')?.errors?.['dob']">
                Enter a valid date as DD/MM/YYYY
              </span>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-zinc-500 px-1">Gender</label>
              <div class="flex gap-2">
                <button type="button" *ngFor="let gd of genders" (click)="aboutForm.get('gender')?.setValue(gd)"
                  class="flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all"
                  [ngClass]="aboutForm.get('gender')?.value === gd ? 'border-violet-500 ring-2 ring-violet-500/20 bg-violet-50/50 text-violet-700' : 'border-zinc-200 text-zinc-600 hover:border-violet-300'">
                  {{ gd }}
                </button>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-zinc-500 px-1">Previous training experience</label>
              <div class="grid grid-cols-2 gap-2">
                <button type="button" *ngFor="let e of experiences" (click)="aboutForm.get('experience')?.setValue(e.key)"
                  class="text-left rounded-xl border px-4 py-2.5 transition-all"
                  [ngClass]="aboutForm.get('experience')?.value === e.key ? 'border-violet-500 ring-2 ring-violet-500/20 bg-violet-50/50' : 'border-zinc-200 hover:border-violet-300'">
                  <span class="block text-sm font-medium text-zinc-900">{{ e.label }}</span>
                  <span class="block text-[11px] text-zinc-500">{{ e.desc }}</span>
                </button>
              </div>
            </div>
          </form>
        </ng-container>

        <!-- ===== Unlocking your plan (between step 3 and 4) ===== -->
        <ng-container *ngIf="processing">
          <div class="promise-card rounded-2xl border border-violet-100 bg-linear-to-b from-violet-50/70 to-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-5">
            <div class="flex items-center gap-2 mb-1">
              <span class="w-1.5 h-4 bg-violet-500 rounded-full"></span>
              <span class="text-[11px] font-semibold uppercase tracking-wide text-violet-600">Your Personalized Plan Includes</span>
            </div>
            <p class="text-zinc-500 text-xs sm:text-sm mb-5">Hang tight — we're putting your plan together.</p>

            <div class="space-y-2.5">
              <div *ngFor="let item of planItems; let i = index"
                   class="flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-all duration-500"
                   [ngClass]="i < unlockedCount ? 'border-emerald-200 bg-emerald-50/60' : 'border-zinc-200 bg-white'">
                <!-- Loader while locked -->
                <span *ngIf="i >= unlockedCount"
                      class="w-5 h-5 rounded-full border-2 border-zinc-200 border-t-violet-500 animate-spin shrink-0"></span>
                <!-- Tick once unlocked -->
                <span *ngIf="i < unlockedCount"
                      class="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px] font-bold shrink-0">✓</span>
                <span class="text-sm font-medium transition-colors duration-500"
                      [ngClass]="i < unlockedCount ? 'text-zinc-900' : 'text-zinc-400'">{{ item }}</span>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- ===== STEP 3: Body analysis (BMI) ===== -->
        <ng-container *ngIf="step === 3 && !processing">
          <h2 class="text-xl sm:text-2xl font-semibold tracking-tight !mb-1 !text-zinc-900">Body analysis</h2>
          <p class="text-zinc-500 text-xs sm:text-sm mb-6">Based on the details you shared.</p>

          <!-- Current vs target physique -->
          <div *ngIf="bmiDetail" class="bg-linear-to-b from-violet-50 to-white rounded-xl border border-zinc-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-3 mb-4">
            <div class="flex items-center justify-between gap-2">
              <div class="flex-1 min-w-0 flex flex-col items-center text-center">
                <div class="w-full overflow-hidden">
                  <img [src]="bmiDetail.currentImage" [alt]="bmiDetail.label" class="block w-full h-32 sm:h-40 object-cover object-top">
                </div>
                <span class="text-[11px] font-medium text-zinc-400 uppercase tracking-wide mt-3">Current</span>
                <span class="text-sm font-semibold text-zinc-900">{{ bmiDetail.label }}</span>
              </div>

              <div class="flex flex-col items-center text-violet-400 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>

              <div class="flex-1 min-w-0 flex flex-col items-center text-center">
                <div class="w-full overflow-hidden">
                  <img [src]="bmiDetail.targetImage" [alt]="bmiDetail.recommendedGoal" class="block w-full h-32 sm:h-40 object-cover object-top">
                </div>
                <span class="text-[11px] font-medium text-violet-500 uppercase tracking-wide mt-3">Goal</span>
                <span class="text-sm font-semibold text-zinc-900">{{ bmiDetail.recommendedGoal }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-zinc-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-semibold text-zinc-900 leading-none">{{ bmi ?? '—' }}</span>
                <span class="text-[11px] text-zinc-400 font-medium">BMI</span>
                <span class="text-xs font-medium" [ngClass]="bmiCategoryColor">{{ bmiCategory }}</span>
              </div>
              <span class="text-[11px] text-zinc-400 font-medium">
                {{ aboutForm.get('weight')?.value }} kg • {{ aboutForm.get('height')?.value }} cm
              </span>
            </div>

            <!-- Scale -->
            <div class="relative mt-6">
              <div class="h-2 w-full rounded-full overflow-hidden flex">
                <div class="bg-sky-400" style="width: 14%"></div>
                <div class="bg-emerald-400" style="width: 26%"></div>
                <div class="bg-amber-400" style="width: 20%"></div>
                <div class="bg-rose-400" style="width: 40%"></div>
              </div>
              <div class="absolute -top-3.5 -translate-x-1/2 transition-all duration-500 flex flex-col items-center"
                [style.left.%]="bmiMarkerPosition">
                <div class="w-6 h-6 rounded-full bg-violet-500 text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white shadow-md">
                  {{ initial }}
                </div>
                <div class="w-0.5 h-1.5 bg-zinc-900"></div>
              </div>
            </div>

            <div class="flex justify-between mt-1.5 text-[9px] font-medium text-zinc-400">
              <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
            </div>
            <div class="flex justify-between mt-1 text-[9px] font-medium">
              <span class="text-sky-600">Underweight</span>
              <span class="text-emerald-600">Normal</span>
              <span class="text-amber-600">Overweight</span>
              <span class="text-rose-600">Obese</span>
            </div>
          </div>

          <!-- Goal timeline -->
          <div *ngIf="goalPlan as plan" class="bg-white rounded-xl border border-zinc-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 mt-4">
            <h3 class="text-base font-medium text-zinc-900 flex items-center gap-2 !mb-4">
              <span class="w-1.5 h-4 bg-violet-500 rounded-full"></span>
              Your Transformation Timeline
            </h3>

            <ng-container *ngIf="!plan.onTrack; else onTrackTpl">
              <!-- Weight path -->
              <div class="flex items-center justify-between gap-2 bg-green-100 rounded-xl px-4 py-3 mb-4">
                <div class="text-center flex-1">
                  <div class="text-[10px] uppercase tracking-wide text-zinc-400 font-medium">Current</div>
                  <div class="text-lg font-semibold text-zinc-900">{{ plan.currentWeight }} kg</div>
                </div>
                <div class="text-center">
                  <div class="text-[10px] uppercase tracking-wide text-violet-500 font-medium">To {{ plan.actionVerb }}</div>
                  <div class="text-sm font-semibold text-violet-600">{{ plan.needed }} kg</div>
                </div>
                <div class="text-center flex-1">
                  <div class="text-[10px] uppercase tracking-wide text-zinc-400 font-medium">Target</div>
                  <div class="text-lg font-semibold text-zinc-900">{{ plan.targetWeight }} kg</div>
                </div>
              </div>

              <!-- Timeline + rate -->
              <div class="flex items-end justify-between mb-5">
                <div>
                  <div class="text-[12px] text-zinc-500 font-medium">Stay consistent, and you could reach your goal in approximately</div>
                  <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-semibold text-green-600 leading-none">{{ plan.months }}</span>
                    <span class="text-sm font-medium text-zinc-600">month{{ plan.months > 1 ? 's' : '' }}</span>
                  </div>
                  <div class="text-[11px] text-zinc-600 mt-0.5">≈ {{ plan.weeks }} weeks</div>
                </div>
                <div class="text-right">
                  <div class="text-[11px] text-zinc-500 font-medium">Expected {{ plan.direction }}</div>
                  <div class="text-sm font-semibold text-zinc-700">{{ plan.rateLabel }}</div>
                </div>
              </div>
            </ng-container>

            <ng-template #onTrackTpl>
              <div class="bg-emerald-50 text-emerald-700 rounded-xl px-4 py-3 mb-5 text-sm font-medium">
                🎉 Great news! You're already in a healthy range. Now let's focus on building strength, improving fitness, and sculpting your physique.
              </div>
            </ng-template>

            <!-- Expected transformation -->
            <div class="text-[11px] uppercase tracking-wide text-zinc-500 font-medium mb-2">Here's what you'll notice</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div *ngFor="let t of plan.transformations" class="flex items-center gap-2 text-sm text-zinc-700">
                <span class="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] flex-shrink-0">✓</span>
                {{ t }}
              </div>
            </div>
          </div>
        </ng-container>

        <!-- ===== STEP 4: Complete profile ===== -->
        <ng-container *ngIf="step === 4">
          <h2 class="text-xl sm:text-2xl font-semibold tracking-tight mb-1 !text-zinc-900">Almost done!</h2>
          <p class="text-zinc-500 text-xs sm:text-sm mb-6">Just one last step to save your personalized fitness plan.</p>

          <form [formGroup]="profileForm" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-zinc-500 px-1">First Name</label>
                <input formControlName="firstName" placeholder="Enter first name"
                  class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all">
                <div class="h-4">
                  <span class="text-[10px] text-rose-500 px-1" *ngIf="profileForm.get('firstName')?.touched && profileForm.get('firstName')?.invalid">First name is required</span>
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-zinc-500 px-1">Last Name</label>
                <input formControlName="lastName" placeholder="Enter last name"
                  class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all">
                <div class="h-4">
                  <span class="text-[10px] text-rose-500 px-1" *ngIf="profileForm.get('lastName')?.touched && profileForm.get('lastName')?.invalid">Last name is required</span>
                </div>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-zinc-500 px-1">Phone Number</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">+91</span>
                <input formControlName="phone" type="tel" placeholder="9876543210"
                  class="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all">
              </div>
              <div class="h-4">
                <span class="text-[10px] text-rose-500 px-1" *ngIf="profileForm.get('phone')?.touched && profileForm.get('phone')?.invalid">
                  {{ profileForm.get('phone')?.hasError('required') ? 'Phone number is required' : 'Enter a valid 10-digit Indian number' }}
                </span>
              </div>
            </div>
          </form>
        </ng-container>

      </div>

      <!-- Footer nav -->
      <div *ngIf="!processing" class="flex items-center justify-between gap-3 px-6 sm:px-8 pb-6 pt-4 shrink-0 border-t border-zinc-100">
        <button type="button" mat-button (click)="back()" [disabled]="step === 1"
          class="!text-zinc-500 !font-medium disabled:!opacity-0">
          Back
        </button>

        <button *ngIf="step > 1 && !isLastStep" type="button" mat-raised-button (click)="next()" [disabled]="!canProceed()"
          class="!bg-violet-600 !text-white !rounded-xl !px-8 !py-6 !font-semibold !shadow-lg hover:!bg-violet-500 disabled:!bg-zinc-200 disabled:!text-zinc-400">
          Next
        </button>

        <button *ngIf="step > 1 && isLastStep" type="button" mat-raised-button (click)="complete()" [disabled]="!canFinish()"
          class="!bg-violet-600 !text-white !rounded-xl !px-8 !py-6 !font-semibold !shadow-lg hover:!bg-violet-500 disabled:!bg-zinc-200 disabled:!text-zinc-400">
          Check Price
        </button>
      </div>
    </div>
  `,
  styles: [`
    .onboarding-container { max-width: 560px; }
  `]
})
export class OnboardingWizardComponent implements OnDestroy {
  step = 1;
  selectedGoal: string | null = null;

  /** "Unlocking your plan" interstitial shown between step 3 and step 4. */
  processing = false;
  /** How many plan items have unlocked (turned from loader → tick) so far. */
  unlockedCount = 0;
  private unlockTimer: any = null;

  /** Benefits revealed one-by-one on the promise card during processing. */
  planItems = [
    'Workout plan based on your goal',
    'Weight & body progress tracking',
    'Expert guidance from our coaches',
    'Regular check-ins to keep you on track',
  ];

  aboutForm: FormGroup;
  profileForm: FormGroup;

  goals: Option[] = [
    { key: 'LOSE_WEIGHT', icon: '🔥', title: 'Lose Weight', desc: 'Reduce body fat, lose weight, and improve body shape.' },
    { key: 'BUILD_MUSCLE', icon: '💪', title: 'Build Muscle', desc: 'Gain muscle, increase size, and improve physique.' },
    { key: 'EVENT', icon: '🎯', title: 'Prepare for an Event', desc: 'Weddings, photoshoots, competitions, marathons, or special occasions.' },
    { key: 'HEALTH', icon: '🩺', title: 'Manage Diabetes / Health', desc: 'Improve lifestyle, activity, weight management, and metabolic health.' },
  ];

  genders = ['Male', 'Female', 'Other'];

  /** Latest selectable DOB (today) — used for the age calculation. */
  maxDob = new Date();

  experiences: Option[] = [
    { key: 'NONE', label: 'New to training', desc: 'Never trained or just starting' },
    { key: 'BEGINNER', label: 'Beginner', desc: 'Less than 6 months' },
    { key: 'INTERMEDIATE', label: 'Intermediate', desc: '6 months – 2 years' },
    { key: 'ADVANCED', label: 'Advanced', desc: '2+ years consistent' },
  ];

  /** Whether the final "Complete profile" (name/phone) step is required. */
  phoneRequired = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OnboardingWizardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email?: string; phoneRequired?: boolean; prefill?: any }
  ) {
    this.phoneRequired = !!data.phoneRequired;
    this.aboutForm = this.fb.group({
      height: [null, [Validators.required, Validators.min(50), Validators.max(272)]],
      weight: [null, [Validators.required, Validators.min(20), Validators.max(500)]],
      dob: [null, [Validators.required, dobValidator]],
      gender: [null, Validators.required],
      experience: [null, Validators.required],
    });

    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    });

    // Pre-fill from a previously saved onboarding profile so users can edit
    // their goal/details instead of starting over.
    const p = data.prefill;
    if (p) {
      this.selectedGoal = p.goal ?? null;
      this.aboutForm.patchValue({
        height: p.height ?? null,
        weight: p.weight ?? null,
        dob: p.dob ?? null,
        gender: p.gender ?? null,
        experience: p.experience ?? null,
      });
    }
  }

  // ----- BMI (same formula as the customer BMI card) -----
  get bmi(): number | null {
    const weight = this.aboutForm.get('weight')?.value;
    const height = this.aboutForm.get('height')?.value;
    if (!weight || !height || height <= 0) return null;
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
  }

  get bmiCategory(): string {
    const bmi = this.bmi;
    if (bmi === null) return '';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  get bmiCategoryColor(): string {
    switch (this.bmiCategory) {
      case 'Underweight': return 'text-sky-600';
      case 'Normal': return 'text-emerald-600';
      case 'Overweight': return 'text-amber-600';
      case 'Obese': return 'text-rose-600';
      default: return 'text-zinc-600';
    }
  }

  get bmiMarkerPosition(): number {
    const bmi = this.bmi;
    if (bmi === null) return 0;
    const min = 15, max = 40;
    const clamped = Math.min(Math.max(bmi, min), max);
    return ((clamped - min) / (max - min)) * 100;
  }

  /** Detailed BMI band (with body images + recommended goal) for the current BMI. */
  get bmiDetail(): (BmiCategory & { currentImage: string; targetImage: string }) | null {
    const bmi = this.bmi;
    if (bmi === null) return null;
    const category = BMI_CATEGORIES.find(c => bmi >= c.min && bmi < c.max);
    if (!category) return null;
    const gender = this.aboutForm.get('gender')?.value;
    return {
      ...category,
      currentImage: bodyImage(category.currentType, gender),
      targetImage: bodyImage(category.targetType, gender),
    };
  }

  /**
   * The goal we actually plan around. Weight/muscle goals are reconciled
   * against BMI so the plan matches the body — e.g. someone already lean who
   * picked "Lose Weight" is steered to build muscle instead (and vice-versa
   * for someone heavier who picked "Build Muscle"). The 21–24 athletic band is
   * ambiguous, so the user's own pick is honoured there. Event/health goals are
   * always kept exactly as chosen. Thresholds mirror BMI_CATEGORIES.
   */
  get effectiveGoalKey(): string | null {
    const goal = this.selectedGoal;
    if (goal !== 'LOSE_WEIGHT' && goal !== 'BUILD_MUSCLE') return goal;
    const bmi = this.bmi;
    if (bmi === null) return goal;
    if (bmi < 21) return 'BUILD_MUSCLE';   // lean → gain muscle, not lose fat
    if (bmi >= 24) return 'LOSE_WEIGHT';   // above athletic → lose fat
    return goal;                           // athletic mid-range → honour choice
  }

  /**
   * Timeline + transformation plan for the user's goal, derived from their
   * current weight and a target weight computed from their height. The goal is
   * BMI-reconciled via {@link effectiveGoalKey}.
   */
  get goalPlan() {
    const plan = GOAL_PLANS[this.effectiveGoalKey ?? ''];
    const weight = this.aboutForm.get('weight')?.value;
    const height = this.aboutForm.get('height')?.value;
    if (!plan || !weight || !height || height <= 0) return null;

    const heightM = height / 100;
    const targetWeight = Math.round(plan.targetBmi * heightM * heightM);
    const diff = plan.direction === 'lose' ? weight - targetWeight : targetWeight - weight;
    const needed = Math.max(0, Math.round(diff));
    const months = needed > 0 ? Math.ceil(needed / plan.ratePerMonth) : 0;
    const weeks = needed > 0 ? Math.ceil((needed / plan.ratePerMonth) * 4.345) : 0;

    return {
      ...plan,
      currentWeight: Math.round(weight),
      targetWeight,
      needed,
      months,
      weeks,
      onTrack: needed === 0,
    };
  }

  /** Age in whole years derived from the selected date of birth. */
  get age(): number | null {
    const birth = parseDob(this.aboutForm.get('dob')?.value);
    if (!birth) return null;
    const today = this.maxDob;
    let years = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      years--;
    }
    return years >= 0 ? years : null;
  }

  get initial(): string {
    const first = this.profileForm.get('firstName')?.value;
    return (first || this.data.email || '?').trim().charAt(0).toUpperCase();
  }

  /** Total steps: 4 when a phone/profile step is required, otherwise 3. */
  get totalSteps(): number {
    return this.phoneRequired ? 4 : 3;
  }

  /** Step numbers for the progress indicator. */
  get steps(): number[] {
    return Array.from({ length: this.totalSteps }, (_, i) => i + 1);
  }

  /** True when the current step is the last one (its CTA finishes the flow). */
  get isLastStep(): boolean {
    return this.step === this.totalSteps;
  }

  /** Auto-format the date of birth field as DD/MM/YYYY while typing. */
  onDobInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '').slice(0, 8); // DDMMYYYY
    let formatted = digits;
    if (digits.length >= 5) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length >= 3) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    this.aboutForm.get('dob')?.setValue(formatted);
  }

  /** Pick a fitness goal and jump straight to the next step. */
  selectGoal(key: string) {
    this.selectedGoal = key;
    this.step = 2;
  }

  canProceed(): boolean {
    if (this.step === 1) return !!this.selectedGoal;
    if (this.step === 2) return this.aboutForm.valid;
    if (this.step === 3) return this.bmi !== null;
    return true;
  }

  /** Whether the final CTA ("Check Price") can be pressed. */
  canFinish(): boolean {
    if (this.phoneRequired) return this.profileForm.valid;
    return this.bmi !== null;
  }

  next() {
    if (this.step === 2 && this.aboutForm.invalid) {
      this.aboutForm.markAllAsTouched();
      return;
    }
    if (!this.canProceed()) return;
    // Leaving the body-analysis step: reveal the "unlocking your plan" promise
    // card before dropping into the final profile step.
    if (this.step === 3 && this.step < this.totalSteps) {
      this.startProcessing();
      return;
    }
    if (this.step < this.totalSteps) this.step++;
  }

  /**
   * Show the promise card and unlock one benefit per second. Once all are
   * ticked, advance to the final step. Feels like unlocking something rather
   * than just filling out a form.
   */
  private startProcessing() {
    this.processing = true;
    this.unlockedCount = 0;
    this.unlockTimer = setInterval(() => {
      this.unlockedCount++;
      if (this.unlockedCount >= this.planItems.length) {
        clearInterval(this.unlockTimer);
        this.unlockTimer = null;
        // Brief hold so the final tick is seen before we move on.
        setTimeout(() => {
          this.processing = false;
          this.step = Math.min(this.step + 1, this.totalSteps);
        }, 700);
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.unlockTimer) clearInterval(this.unlockTimer);
  }

  back() {
    if (this.step > 1) this.step--;
  }

  complete() {
    if (this.phoneRequired && this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.dialogRef.close({
      profile: this.phoneRequired
        ? { ...this.profileForm.value, email: this.data.email }
        : null,
      fitness: {
        goal: this.selectedGoal,
        // The BMI-reconciled goal the plan/transformations were built from.
        effectiveGoal: this.effectiveGoalKey,
        ...this.aboutForm.value,
        age: this.age,
        bmi: this.bmi,
        bmiCategory: this.bmiCategory,
        targetWeight: this.goalPlan?.targetWeight ?? null,
        timelineMonths: this.goalPlan?.months ?? null,
        timelineWeeks: this.goalPlan?.weeks ?? null,
        // Before/after physique so the shop page can show the transformation.
        currentImage: this.bmiDetail?.currentImage ?? null,
        targetImage: this.bmiDetail?.targetImage ?? null,
        recommendedGoal: this.bmiDetail?.recommendedGoal ?? null,
        transformations: this.goalPlan?.transformations ?? [],
      }
    });
  }
}
