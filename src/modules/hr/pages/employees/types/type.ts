export type HrCalendarStatusCode =
  | "WORKED"
  | "PLANNED_WORK"
  | "DAY_OFF"
  | "ANNUAL_LEAVE"
  | "SICK_LEAVE"
  | "UNPAID_LEAVE"
  | "UNEXCUSED_ABSENCE";

export interface HrWorkScheduleDay {
  dayOfWeek: number;
  workHours: number;
}

export interface HrWorkSchedule {
  id: number;
  employeeId?: number;
  name: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  days: HrWorkScheduleDay[];
}

export interface HrEmployeeCalendarDay {
  date: string;
  statusCode: HrCalendarStatusCode;
  workHours?: number | null;
  absenceId?: number | null;
  note?: string | null;
}
