export interface PayrollTimesheetLineForm {
  employeeId: number | null;
  employeeName?: string | null;
  employeeNumber?: string | null;
  departmentName?: string | null;
  normWorkDays: number | null;
  normWorkHours: number | null;
  workedDays: number | null;
  workedHours: number | null;
  leaveDays: number | null;
  sickDays: number | null;
  absentDays: number | null;
  overtimeHours: number | null;
  nightHours: number | null;
  holidayHours: number | null;
  weekendHours: number | null;
  note: string | null;
  days: PayrollTimesheetDayForm[];
  isLegacy?: boolean;
}

export interface PayrollTimesheetDayForm {
  date: string;
  statusCode: string;
  sourceStatusCode?: string | null;
  sourceAbsenceId?: number | null;
  sourceScheduleId?: number | null;
  sourceAbsenceTypeId?: number | null;
  absenceTypeId: number | null;
  timesheetCategory?: "LEAVE" | "SICK" | "ABSENT" | null;
  statusName?: string | null;
  absenceTypeCode?: string | null;
  absenceTypeName?: string | null;
  workedHours?: number | null;
  plannedHours?: number | null;
  overtimeHours?: number | null;
  nightHours?: number | null;
  holidayHours?: number | null;
  weekendHours?: number | null;
  isOverridden?: boolean;
}

export interface PayrollTimesheetForm {
  periodId: number | null;
  docDate: string;
  note: string | null;
  lines: PayrollTimesheetLineForm[];
}
