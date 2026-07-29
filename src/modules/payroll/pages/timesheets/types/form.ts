export interface PayrollTimesheetLineForm {
  employeeId: number | null;
  employeeName?: string | null;
  employeeNumber?: string | null;
  departmentName?: string | null;
  workedDays: number | null;
  workedHours: number | null;
  leaveDays: number | null;
  sickDays: number | null;
  absentDays: number | null;
  overtimeHours: number | null;
  note: string | null;
}

export interface PayrollTimesheetForm {
  periodId: number | null;
  docDate: string;
  note: string | null;
  lines: PayrollTimesheetLineForm[];
}
