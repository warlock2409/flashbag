export type DurationUnit = 'DAY' | 'MONTH' | 'YEAR';

export interface BoosterPlanDto {
  id?: number;
  membershipPlanId?: number;
  price: number;
  attendanceTargetDays: number;
  rewardDurationValue: number;
  rewardDurationUnit: DurationUnit;
  active: boolean;
}
