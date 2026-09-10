export type PayrollPeriodDayType =
  | "NORMAL"
  | "HOLIDAY"
  | "TRANSFERRED"
  | "SHORTENED";

export interface PayrollPeriodCalendarDayForm {
  date: string;
  dayType: PayrollPeriodDayType;
  workHours: number;
  isWorkDay: boolean;
}

export interface PayrollPeriodForm {
  year: number | null;
  month: number | null;
  dailyWorkHours: number | null;
  workDates: string[];
  calendarDays: PayrollPeriodCalendarDayForm[];
}
