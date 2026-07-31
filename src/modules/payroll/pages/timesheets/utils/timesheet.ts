import dayjs from "dayjs";
import { DATE_TIME_FORMAT } from "../../../utils/format";
import type {
  PayrollTimesheetForm,
  PayrollTimesheetLineForm,
} from "../types/form";
import type {
  PayrollTimesheet,
  PayrollTimesheetCalendar,
} from "../types/type";

export const createTimesheetLine = (
  overrides: Partial<PayrollTimesheetLineForm> = {},
): PayrollTimesheetLineForm => ({
  employeeId: null,
  employeeName: null,
  employeeNumber: null,
  departmentName: null,
  normWorkDays: 0,
  normWorkHours: 0,
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
        normWorkDays: line.normWorkDays ?? record.normWorkDays ?? 0,
        normWorkHours: line.normWorkHours ?? record.normWorkHours ?? 0,
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
      normWorkDays: total.normWorkDays + (line.normWorkDays ?? 0),
      normWorkHours: total.normWorkHours + (line.normWorkHours ?? 0),
      workedDays: total.workedDays + (line.workedDays ?? 0),
      workedHours: total.workedHours + (line.workedHours ?? 0),
      leaveDays: total.leaveDays + (line.leaveDays ?? 0),
      sickDays: total.sickDays + (line.sickDays ?? 0),
      absentDays: total.absentDays + (line.absentDays ?? 0),
      overtimeHours: total.overtimeHours + (line.overtimeHours ?? 0),
    }),
    {
      employees: 0,
      normWorkDays: 0,
      normWorkHours: 0,
      workedDays: 0,
      workedHours: 0,
      leaveDays: 0,
      sickDays: 0,
      absentDays: 0,
      overtimeHours: 0,
    },
  );

export const mapCalendarToTimesheetLine = (
  calendar: PayrollTimesheetCalendar,
): Partial<PayrollTimesheetLineForm> => {
  const days = calendar.days ?? [];
  const count = (statuses: string[]) =>
    days.filter((day) => statuses.includes(day.statusCode)).length;
  const sumHours = (
    statuses: string[],
    field: "workHours" | "plannedHours",
  ) =>
    days
      .filter((day) => statuses.includes(day.statusCode))
      .reduce((total, day) => total + (day[field] ?? 0), 0);

  const normStatuses = [
    "WORKED",
    "PLANNED_WORK",
    "ANNUAL_LEAVE",
    "SICK_LEAVE",
    "UNPAID_LEAVE",
    "UNEXCUSED_ABSENCE",
  ];

  return {
    normWorkDays: calendar.normWorkDays ?? count(normStatuses),
    normWorkHours:
      calendar.normWorkHours ??
      (days.some((day) => day.plannedHours != null)
        ? sumHours(normStatuses, "plannedHours")
        : sumHours(normStatuses, "workHours")),
    workedDays: calendar.workedDays ?? count(["WORKED"]),
    workedHours:
      calendar.workedHours ?? sumHours(["WORKED"], "workHours"),
    leaveDays:
      calendar.leaveDays ?? count(["ANNUAL_LEAVE", "UNPAID_LEAVE"]),
    sickDays: calendar.sickDays ?? count(["SICK_LEAVE"]),
    absentDays:
      calendar.absentDays ?? count(["UNEXCUSED_ABSENCE"]),
    overtimeHours: calendar.overtimeHours ?? 0,
  };
};
