import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ActivityLevel {
  key: string;
  label: string;
  desc: string;
  factor: number;
}

interface Phase {
  no: number;
  range: string;
  name: string;
  deficit: string;
  focus: string[];
  expected: string;
  // Full static Tailwind class strings — dynamically-built class names
  // (e.g. `'bg-' + accent`) get purged, so we spell them out.
  badgeBg: string;
  borderCls: string;
  deficitText: string;
  dotBg: string;
}

interface BurnChannel { icon: string; title: string; desc: string; }

interface CalorieRow { bmi: string; category: string; maintenance: string; fatLoss: string; }

// Two people, identical calorie deficit — the difference is what training does
// to the *composition* of the weight they lose.
interface DietPath {
  title: string;
  detail: string;      // how the same deficit is reached
  deficit: string;
  outcome: string[];   // what actually happens to the body
  good: boolean;       // drives the good/bad styling
}

interface Benefit { icon: string; text: string; }

const ACTIVITY_LEVELS: ActivityLevel[] = [
  { key: 'SEDENTARY', label: 'Sedentary', desc: 'Little or no exercise', factor: 1.2 },
  { key: 'LIGHT', label: 'Light activity', desc: 'Walking, light chores', factor: 1.35 },
  { key: 'GYM', label: 'Gym 3–5 days', desc: 'Regular training', factor: 1.55 },
  { key: 'HEAVY', label: 'Heavy training', desc: 'Intense daily training', factor: 1.7 },
];

// One kg of body fat stores roughly 7700 kcal — the constant behind every
// deficit-to-weight projection on this page.
const KCAL_PER_KG_FAT = 7700;

// Safety floor: we never recommend eating below this, even for aggressive fat
// loss. Losing ~1 kg/week needs a ~1100 kcal/day deficit, which for most people
// would drop intake under this floor — so the achievable rate is capped instead.
const MIN_CALORIES = 1500;

@Component({
  selector: 'app-weight-loss-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weight-loss-calculator.component.html',
  styleUrls: ['./weight-loss-calculator.component.scss'],
})
export class WeightLossCalculatorComponent {
  // ----- Inputs -----
  gender: 'male' | 'female' = 'male';
  genderOptions: Array<'male' | 'female'> = ['male', 'female'];
  age: number | null = 30;
  height: number | null = 170;   // cm
  weight: number | null = 90;    // kg
  activityKey = 'GYM';

  activityLevels = ACTIVITY_LEVELS;

  // ----- The four ways the body burns calories -----
  burnChannels: BurnChannel[] = [
    { icon: '❤️', title: 'BMR (Basal Metabolic Rate)', desc: 'Breathing, heart, brain & body temperature — energy just to stay alive.' },
    { icon: '🚶', title: 'Daily activity', desc: 'Walking, work and household movement (NEAT).' },
    { icon: '🏋️', title: 'Exercise', desc: 'Strength training, cardio and group workouts.' },
    { icon: '🍽️', title: 'Food digestion', desc: 'Calories used to process the food you eat (TEF).' },
  ];

  // ----- Diet decides IF you lose; training decides WHAT you lose -----
  // Same 750 kcal/day deficit, reached two different ways. The deficit is
  // identical — the outcome is not, because training tells the body which
  // tissue to keep.
  dietPaths: DietPath[] = [
    {
      title: 'Diet only',
      detail: 'Eat 1,500 · burn 2,250',
      deficit: '750 kcal / day deficit',
      outcome: ['Loses fat AND muscle', 'Metabolism slows as you shrink', 'Weaker, hungrier', 'Higher chance of regaining it'],
      good: false,
    },
    {
      title: 'Diet + strength training',
      detail: 'Eat 1,800 · burn 2,550',
      deficit: '750 kcal / day deficit',
      outcome: ['Burns more fat, keeps muscle', 'Metabolism stays higher', 'Stronger through the cut', 'Results that actually last'],
      good: true,
    },
  ];

  // Burning ~300 kcal is one of the *least* important things training does.
  benefits: Benefit[] = [
    { icon: '💪', text: 'Preserves muscle' },
    { icon: '🔥', text: 'Keeps metabolism higher' },
    { icon: '🩸', text: 'Improves insulin sensitivity' },
    { icon: '❤️', text: 'Better heart health' },
    { icon: '🦴', text: 'Increases bone density' },
    { icon: '⚡', text: 'More energy & better mood' },
  ];

  // ----- Rough calories by BMI band (male, 25–40, moderate activity) -----
  calorieTable: CalorieRow[] = [
    { bmi: '24–27', category: 'Average',        maintenance: '2200–2600 kcal', fatLoss: '1700–2100 kcal' },
    { bmi: '27–30', category: 'Overweight',     maintenance: '2400–2800 kcal', fatLoss: '1800–2200 kcal' },
    { bmi: '30–35', category: 'Obese',          maintenance: '2600–3200 kcal', fatLoss: '1800–2400 kcal' },
    { bmi: '35+',   category: 'Severe Obesity', maintenance: '3000–3800 kcal', fatLoss: '2200–2800 kcal' },
  ];

  // ----- The 90-day Shape Shift phases (static, educational) -----
  phases: Phase[] = [
    {
      no: 1, range: 'Day 1–30', name: 'Reset Phase',
      deficit: 'TDEE − 500',
      focus: ['Protein', 'Daily steps', 'Strength training'],
      expected: '3–5 kg loss',
      badgeBg: 'bg-emerald-500', borderCls: 'border-emerald-200', deficitText: 'text-emerald-600', dotBg: 'bg-emerald-400',
    },
    {
      no: 2, range: 'Day 31–60', name: 'Transformation Phase',
      deficit: 'TDEE − 750',
      focus: ['Progressive overload', 'More steps', 'Better sleep'],
      expected: '4–5 kg loss',
      badgeBg: 'bg-violet-500', borderCls: 'border-violet-200', deficitText: 'text-violet-600', dotBg: 'bg-violet-400',
    },
    {
      no: 3, range: 'Day 61–90', name: 'Shape Phase',
      deficit: 'TDEE − 750 to 1000',
      focus: ['Muscle preservation', 'Visible transformation'],
      expected: '3–5 kg loss',
      badgeBg: 'bg-amber-500', borderCls: 'border-amber-200', deficitText: 'text-amber-600', dotBg: 'bg-amber-400',
    },
  ];

  // ===== Core calculations =====

  private get valid(): boolean {
    return !!this.weight && !!this.height && !!this.age && this.height > 0;
  }

  get activity(): ActivityLevel {
    return this.activityLevels.find(a => a.key === this.activityKey) ?? this.activityLevels[0];
  }

  /** BMI = weight(kg) ÷ height(m)². */
  get bmi(): number | null {
    if (!this.weight || !this.height || this.height <= 0) return null;
    const m = this.height / 100;
    return +(this.weight / (m * m)).toFixed(1);
  }

  get bmiCategory(): string {
    const b = this.bmi;
    if (b === null) return '';
    if (b < 18.5) return 'Underweight';
    if (b < 25) return 'Average';
    if (b < 30) return 'Overweight';
    if (b < 35) return 'Obese';
    return 'Severe Obesity';
  }

  get bmiCategoryColor(): string {
    switch (this.bmiCategory) {
      case 'Underweight': return 'text-sky-600';
      case 'Average': return 'text-emerald-600';
      case 'Overweight': return 'text-amber-600';
      case 'Obese': return 'text-orange-600';
      case 'Severe Obesity': return 'text-rose-600';
      default: return 'text-zinc-600';
    }
  }

  /** Marker position (0–100%) on the 15–40 BMI scale. */
  get bmiMarkerPosition(): number {
    const b = this.bmi;
    if (b === null) return 0;
    const min = 15, max = 40;
    const clamped = Math.min(Math.max(b, min), max);
    return ((clamped - min) / (max - min)) * 100;
  }

  /**
   * BMR via the Mifflin-St Jeor equation.
   *   Male:   10·w + 6.25·h − 5·age + 5
   *   Female: 10·w + 6.25·h − 5·age − 161
   */
  get bmr(): number | null {
    if (!this.valid) return null;
    const base = 10 * this.weight! + 6.25 * this.height! - 5 * this.age!;
    return Math.round(base + (this.gender === 'male' ? 5 : -161));
  }

  /** TDEE = BMR × activity factor. */
  get tdee(): number | null {
    const bmr = this.bmr;
    return bmr === null ? null : Math.round(bmr * this.activity.factor);
  }

  /** The lowest daily intake we will ever recommend. */
  readonly minCalories = MIN_CALORIES;

  /**
   * Largest deficit we can safely prescribe without dropping intake below the
   * {@link MIN_CALORIES} floor. Zero when maintenance is already at/under it.
   */
  get maxSafeDeficit(): number | null {
    return this.tdee === null ? null : Math.max(0, this.tdee - MIN_CALORIES);
  }

  /** Max safe fat loss per week, respecting the calorie floor (kg). */
  get maxWeeklyLoss(): number | null {
    const d = this.maxSafeDeficit;
    return d === null ? null : +((d * 7) / KCAL_PER_KG_FAT).toFixed(2);
  }

  /** Max safe fat loss over the 90-day program, respecting the floor (kg). */
  get maxNinetyDayLoss(): number | null {
    const d = this.maxSafeDeficit;
    return d === null ? null : +((d * 90) / KCAL_PER_KG_FAT).toFixed(1);
  }

  // ----- Health constraint: don't let people get too lean -----
  // A healthy BMI band. We never recommend losing past the lower bound —
  // e.g. an "Average" person losing the full 15 kg would end up underweight.
  readonly healthyMinBmi = 18.5;
  readonly healthyMaxBmi = 25;

  private weightAtBmi(bmi: number): number | null {
    if (!this.height || this.height <= 0) return null;
    const m = this.height / 100;
    return Math.round(bmi * m * m);
  }

  /** Lower/upper healthy weight for this height (kg). */
  get healthyWeightLow(): number | null { return this.weightAtBmi(this.healthyMinBmi); }
  get healthyWeightHigh(): number | null { return this.weightAtBmi(this.healthyMaxBmi); }

  /** Most they can lose while staying at or above a healthy weight (kg). */
  get maxHealthyLoss(): number | null {
    if (!this.weight || this.healthyWeightLow === null) return null;
    return Math.max(0, +(this.weight - this.healthyWeightLow).toFixed(1));
  }

  /**
   * The loss we actually recommend: the tighter of the calorie-floor limit and
   * the health limit. This is the honest "max weight loss you can try".
   */
  get recommendedMaxLoss(): number | null {
    const byCalorie = this.maxNinetyDayLoss;
    const byHealth = this.maxHealthyLoss;
    if (byCalorie === null || byHealth === null) return null;
    return +Math.min(byCalorie, byHealth).toFixed(1);
  }

  /** Which constraint is binding the recommendation. */
  get limitingFactor(): 'health' | 'calorie' | null {
    const byCalorie = this.maxNinetyDayLoss;
    const byHealth = this.maxHealthyLoss;
    if (byCalorie === null || byHealth === null) return null;
    return byHealth < byCalorie ? 'health' : 'calorie';
  }

  /** Weight after the recommended maximum loss (kg). */
  get recommendedTargetWeight(): number | null {
    if (!this.weight || this.recommendedMaxLoss === null) return null;
    return Math.round(this.weight - this.recommendedMaxLoss);
  }

  /**
   * Daily deficit that delivers the recommended loss over 90 days, tailored to
   * this customer's state. Always ≤ {@link maxSafeDeficit}, so the resulting
   * intake never breaches the calorie floor.
   */
  get recommendedDailyDeficit(): number | null {
    if (this.recommendedMaxLoss === null) return null;
    return Math.round((this.recommendedMaxLoss * KCAL_PER_KG_FAT) / 90);
  }

  /** Daily calories to eat at the recommended deficit (kcal). */
  get recommendedDailyCalories(): number | null {
    if (this.tdee === null || this.recommendedDailyDeficit === null) return null;
    return this.tdee - this.recommendedDailyDeficit;
  }

  /** BMI they'd end at if they lost the full 15 kg headline goal. */
  get bmiAfterFifteen(): number | null {
    if (!this.weight || !this.height || this.height <= 0) return null;
    const m = this.height / 100;
    return +(Math.max(0, this.weight - 15) / (m * m)).toFixed(1);
  }

  /** True when the 15 kg headline goal would push them below a healthy weight. */
  get fifteenTooMuch(): boolean {
    return this.maxHealthyLoss !== null && this.maxHealthyLoss < 15;
  }

  /** Already at/below a healthy minimum — losing weight isn't the goal. */
  get alreadyLean(): boolean {
    return this.maxHealthyLoss !== null && this.maxHealthyLoss <= 0;
  }

  /**
   * True when the person's maintenance is so close to (or below) the floor that
   * no safe calorie deficit is possible — the answer is to burn more, not eat
   * less.
   */
  get floorReached(): boolean {
    return this.maxSafeDeficit !== null && this.maxSafeDeficit <= 0;
  }

  // ----- Deficit targets, clamped to the calorie floor -----

  private clampToFloor(raw: number | null): number | null {
    return raw === null ? null : Math.max(MIN_CALORIES, raw);
  }

  /** Beginner target: TDEE − 500, never below the floor. */
  get beginnerCalories(): number | null {
    return this.clampToFloor(this.tdee === null ? null : this.tdee - 500);
  }

  /** Aggressive fat-loss target: TDEE − 900, never below the floor. */
  get aggressiveCalories(): number | null {
    return this.clampToFloor(this.tdee === null ? null : this.tdee - 900);
  }

  /** True when a target had to be lifted up to the calorie floor. */
  get beginnerFloored(): boolean {
    return this.tdee !== null && this.tdee - 500 < MIN_CALORIES;
  }
  get aggressiveFloored(): boolean {
    return this.tdee !== null && this.tdee - 900 < MIN_CALORIES;
  }

  /** Actual deficit applied at each target after the floor clamp. */
  get beginnerDeficit(): number | null {
    return this.tdee === null || this.beginnerCalories === null ? null : this.tdee - this.beginnerCalories;
  }
  get aggressiveDeficit(): number | null {
    return this.tdee === null || this.aggressiveCalories === null ? null : this.tdee - this.aggressiveCalories;
  }

  /** Protein target range in grams: 1.6–2.2 g per kg body weight. */
  get proteinLow(): number | null {
    return this.weight ? Math.round(this.weight * 1.6) : null;
  }
  get proteinHigh(): number | null {
    return this.weight ? Math.round(this.weight * 2.2) : null;
  }

  /**
   * Projected fat loss over 90 days for a given daily deficit.
   * kg = (deficit × 90) ÷ 7700.
   */
  projectedLoss(dailyDeficit: number): number {
    return +((dailyDeficit * 90) / KCAL_PER_KG_FAT).toFixed(1);
  }

  /** Daily deficit needed to lose a target kg over 90 days. */
  deficitForLoss(kg: number): number {
    return Math.round((kg * KCAL_PER_KG_FAT) / 90);
  }

  /** Projected 90-day loss at the beginner target (uses the clamped deficit). */
  get beginnerLoss(): number | null {
    return this.beginnerDeficit === null ? null : this.projectedLoss(this.beginnerDeficit);
  }
  /** Projected 90-day loss at the aggressive target (uses the clamped deficit). */
  get aggressiveLoss(): number | null {
    return this.aggressiveDeficit === null ? null : this.projectedLoss(this.aggressiveDeficit);
  }
}
