import dayjs from "dayjs";
import { DATE_TIME_FORMAT } from "../../../utils/format";
import type {
  PayrollTimesheetForm,
  PayrollTimesheetLineForm,
} from "../types/form";
import type { PayrollTimesheet } from "../types/type";

export const createTimesheetLine = (
  overrides: Partial<PayrollTimesheetLineForm> = {},
): PayrollTimesheetLineForm => ({
  employeeId: null,
  employeeName: null,
  employeeNumber: null,
  departmentName: null,
  workedDays: 0,
  workedHours: 0,
  leaveDays: 0,
  sickDays: 0,
  absentDays: 0,
  overtimeHours: 0,
  note: null,
  ...overrides,
});

export const createDefaultTimesheetForm = (
  periodId: number | null = null,
): PayrollTimesheetForm => ({
  periodId,
  docDate: dayjs().format(DATE_TIME_FORMAT),
  note: null,
  lines: [],
});

export const mapTimesheetToForm = (
  record?: PayrollTimesheet | null,
): PayrollTimesheetForm => {
  if (!record) return createDefaultTimesheetForm();
  return {
    periodId: record.periodId ?? null,
    docDate: record.docDate ?? dayjs().format(DATE_TIME_FORMAT),
    note: record.note ?? null,
    lines: (record.lines ?? []).map((line) =>
      createTimesheetLine({
        employeeId: line.employeeId,
        employeeName: line.employeeName,
        employeeNumber: line.employeeNumber,
        departmentName: line.departmentName,
        workedDays: line.workedDays ?? 0,
        workedHours: line.workedHours ?? 0,
        leaveDays: line.leaveDays ?? 0,
        sickDays: line.sickDays ?? 0,
        absentDays: line.absentDays ?? 0,
        overtimeHours: line.overtimeHours ?? 0,
        note: line.note ?? null,
      }),
    ),
  };
};

/** Qatorlar bo'yicha jamlanma — sarlavhada ko'rsatiladi. */
export const summarizeTimesheet = (lines: PayrollTimesheetLineForm[]) =>
  lines.reduce(
    (total, line) => ({
      employees: total.employees + 1,
      workedDays: total.workedDays + (line.workedDays ?? 0),
      workedHours: total.workedHours + (line.workedHours ?? 0),
      leaveDays: total.leaveDays + (line.leaveDays ?? 0),
      sickDays: total.sickDays + (line.sickDays ?? 0),
      absentDays: total.absentDays + (line.absentDays ?? 0),
      overtimeHours: total.overtimeHours + (line.overtimeHours ?? 0),
    }),
    {
      employees: 0,
      workedDays: 0,
      workedHours: 0,
      leaveDays: 0,
      sickDays: 0,
      absentDays: 0,
      overtimeHours: 0,
    },
  );
