export interface HolidayDto {
  id?: number;
  orgId?: number;
  shopId?: number;
  holidayDate: Date;
  name: string;
  notify: boolean;
}