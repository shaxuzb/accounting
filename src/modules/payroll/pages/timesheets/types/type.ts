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
  nightHours?: number | null;
  holidayHours?: number | null;
  weekendHours?: number | null;
  note?: string | null;
  isLegacy?: boolean;
  days?: PayrollTimesheetDay[];
}

export type PayrollTimesheetAttendanceStatus = string;

export interface PayrollAttendanceStatusOption {
  code: string;
  name: string;
  kind: "FIXED" | "ABSENCE" | string;
  absenceTypeId?: number | null;
  timesheetCategory?: "LEAVE" | "SICK" | "ABSENT" | null;
}

export interface PayrollTimesheetDay {
  date: string;
  sourceStatusCode?: string | null;
  sourceAbsenceId?: number | null;
  sourceScheduleId?: number | null;
  sourceAbsenceTypeId?: number | null;
  statusCode: string;
  statusName?: string | null;
  absenceTypeId?: number | null;
  absenceTypeCode?: string | null;
  absenceTypeName?: string | null;
  timesheetCategory?: "LEAVE" | "SICK" | "ABSENT" | null;
  workedHours?: number | null;
  plannedHours?: number | null;
  overtimeHours?: number | null;
  nightHours?: number | null;
  holidayHours?: number | null;
  weekendHours?: number | null;
  isOverridden?: boolean;
}

export interface PayrollTimesheetCalendarDay {
  date: string;
  dayOfWeek?: number;
  dayName?: string | null;
  statusCode: PayrollTimesheetAttendanceStatus;
  statusName?: string | null;
  scheduleId?: number | null;
  absenceId?: number | null;
  absenceTypeId?: number | null;
  workHours?: number | null;
  plannedHours?: number | null;
  workedHours?: number | null;
  overtimeHours?: number | null;
  nightHours?: number | null;
  holidayHours?: number | null;
  weekendHours?: number | null;
  absenceTypeCode?: string | null;
  absenceTypeName?: string | null;
  timesheetCategory?: string | null;
  sourceStatusCode?: string | null;
  sourceAbsenceId?: number | null;
  sourceScheduleId?: number | null;
  sourceAbsenceTypeId?: number | null;
  isOverridden?: boolean;
}

export interface PayrollTimesheetDailyEmployee {
  employeeId: number;
  employeeNumber?: string | null;
  employeeName?: string | null;
  statusCode: PayrollTimesheetAttendanceStatus;
  statusName?: string | null;
  plannedHours?: number | null;
  workedHours?: number | null;
  overtimeHours?: number | null;
  nightHours?: number | null;
  holidayHours?: number | null;
  weekendHours?: number | null;
  scheduleId?: number | null;
  absenceId?: number | null;
  absenceTypeId?: number | null;
  absenceTypeCode?: string | null;
  absenceTypeName?: string | null;
  timesheetCategory?: string | null;
  sourceStatusCode?: string | null;
  sourceAbsenceId?: number | null;
  sourceScheduleId?: number | null;
  sourceAbsenceTypeId?: number | null;
  isOverridden?: boolean;
}

export interface PayrollTimesheetDailyAttendance {
  date: string;
  dayOfWeek?: number | null;
  dayName?: string | null;
  employees: PayrollTimesheetDailyEmployee[];
}

export interface PayrollTimesheetMonthlySummary {
  timesheetLineId?: number | null;
  employeeId: number;
  employeeNumber?: string | null;
  employeeName?: string | null;
  isIncludedInDocument?: boolean;
  normWorkDays?: number | null;
  normWorkHours?: number | null;
  workedDays?: number | null;
  workedHours?: number | null;
  plannedWorkDays?: number | null;
  plannedWorkHours?: number | null;
  leaveDays?: number | null;
  sickDays?: number | null;
  paidLeaveDays?: number | null;
  paidSickDays?: number | null;
  absentDays?: number | null;
  overtimeHours?: number | null;
  nightHours?: number | null;
  holidayHours?: number | null;
  weekendHours?: number | null;
  note?: string | null;
  isLegacy?: boolean;
  days?: PayrollTimesheetDay[];
}

export interface PayrollTimesheetCalendarSummary {
  normWorkDays?: number | null;
  normWorkHours?: number | null;
  workedDays?: number | null;
  workedHours?: number | null;
  plannedWorkDays?: number | null;
  plannedWorkHours?: number | null;
  leaveDays?: number | null;
  sickDays?: number | null;
  absentDays?: number | null;
  overtimeHours?: number | null;
}

export interface PayrollTimesheetCalendar {
  timesheetId?: number | null;
  periodId: number;
  periodName?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  employeeId?: number | null;
  employeeNumber?: string | null;
  employeeName?: string | null;
  summary?: PayrollTimesheetCalendarSummary | null;
  normWorkDays?: number | null;
  normWorkHours?: number | null;
  workedDays?: number | null;
  workedHours?: number | null;
  leaveDays?: number | null;
  sickDays?: number | null;
  absentDays?: number | null;
  overtimeHours?: number | null;
  days?: PayrollTimesheetCalendarDay[];
  isLegacy?: boolean;
  dailyAttendance?: PayrollTimesheetDailyAttendance[];
  monthlySummary?: PayrollTimesheetMonthlySummary[];
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
  calendar?: PayrollTimesheetCalendar | null;
  lines?: PayrollTimesheetLine[];
}
