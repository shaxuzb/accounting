export interface PayrollTimesheetLine {
  id?: number;
  employeeId: number;
  employeeName?: string | null;
  employeeNumber?: string | null;
  departmentName?: string | null;
  positionName?: string | null;
  normWorkDays: number;
  normWorkHours: number;
  workedDays: number;
  workedHours: number;
  leaveDays: number;
  sickDays: number;
  absentDays: number;
  overtimeHours: number;
  note?: string | null;
}

export interface PayrollTimesheetCalendarDay {
  date: string;
  statusCode:
    | "WORKED"
    | "PLANNED_WORK"
    | "DAY_OFF"
    | "ANNUAL_LEAVE"
    | "SICK_LEAVE"
    | "UNPAID_LEAVE"
    | "UNEXCUSED_ABSENCE";
  workHours?: number | null;
  plannedHours?: number | null;
}

export interface PayrollTimesheetCalendar {
  periodId: number;
  employeeId: number;
  normWorkDays?: number | null;
  normWorkHours?: number | null;
  workedDays?: number | null;
  workedHours?: number | null;
  leaveDays?: number | null;
  sickDays?: number | null;
  absentDays?: number | null;
  overtimeHours?: number | null;
  days?: PayrollTimesheetCalendarDay[];
}

export interface PayrollTimesheet {
  id: number;
  organizationId?: number | null;
  docNumber?: string | null;
  docDate: string;
  periodId: number;
  periodYear?: number | null;
  periodMonth?: number | null;
  periodName?: string | null;
  normWorkDays?: number | null;
  normWorkHours?: number | null;
  note?: string | null;
  statusId?: number | null;
  statusName?: string | null;
  stateId?: number | null;
  stateName?: string | null;
  createdDate?: string | null;
  postedAt?: string | null;
  cancelledAt?: string | null;
  employeeCount?: number | null;
  totalWorkedDays?: number | null;
  totalWorkedHours?: number | null;
  lines?: PayrollTimesheetLine[];
}
