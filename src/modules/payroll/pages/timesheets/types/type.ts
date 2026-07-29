export interface PayrollTimesheetLine {
  id?: number;
  employeeId: number;
  employeeName?: string | null;
  employeeNumber?: string | null;
  departmentName?: string | null;
  positionName?: string | null;
  workedDays: number;
  workedHours: number;
  leaveDays: number;
  sickDays: number;
  absentDays: number;
  overtimeHours: number;
  note?: string | null;
}

export interface PayrollTimesheet {
  id: number;
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
  employeeCount?: number | null;
  totalWorkedDays?: number | null;
  totalWorkedHours?: number | null;
  lines?: PayrollTimesheetLine[];
}
