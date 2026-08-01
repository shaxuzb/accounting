import dayjs from "dayjs";
import { DATE_TIME_FORMAT } from "../../../utils/format";
import type {
  PayrollTimesheetForm,
  PayrollTimesheetLineForm,
} from "../types/form";
import type {
  PayrollTimesheet,
  PayrollTimesheetCalendar,
  PayrollTimesheetMonthlySummary,
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
  const summary = calendar.summary;
  const count = (statuses: string[]) =>
    days.filter((day) => statuses.includes(day.statusCode)).length;
  const sumHours = (
    statuses: string[],
    field: "workHours" | "plannedHours" | "workedHours",
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
  const derivedWorkedDays = count(["WORKED"]);
  const derivedWorkedHours = sumHours(["WORKED"], "workedHours");

  return {
    normWorkDays:
      summary?.normWorkDays ?? calendar.normWorkDays ?? count(normStatuses),
    normWorkHours:
      summary?.normWorkHours ??
      calendar.normWorkHours ??
      (days.some((day) => day.plannedHours != null)
        ? sumHours(normStatuses, "plannedHours")
        : sumHours(normStatuses, "workHours")),
    workedDays:
      summary?.workedDays && summary.workedDays > 0
        ? summary.workedDays
        : calendar.workedDays && calendar.workedDays > 0
          ? calendar.workedDays
          : derivedWorkedDays,
    workedHours:
      summary?.workedHours && summary.workedHours > 0
        ? summary.workedHours
        : calendar.workedHours && calendar.workedHours > 0
          ? calendar.workedHours
          : derivedWorkedHours,
    leaveDays:
      summary?.leaveDays ??
      calendar.leaveDays ??
      count(["ANNUAL_LEAVE", "UNPAID_LEAVE"]),
    sickDays:
      summary?.sickDays ?? calendar.sickDays ?? count(["SICK_LEAVE"]),
    absentDays:
      summary?.absentDays ??
      calendar.absentDays ??
      count(["UNEXCUSED_ABSENCE"]),
    overtimeHours: summary?.overtimeHours ?? calendar.overtimeHours ?? 0,
  };
};

/** Xodim kalendarini umumiy sana-by-sana tabel ko'rinishiga o'tkazadi. */
export const mapEmployeeCalendarToTimesheetCalendar = (
  calendar: PayrollTimesheetCalendar,
  periodId: number,
  periodName?: string | null,
): PayrollTimesheetCalendar => {
  const employeeId = calendar.employeeId;
  if (employeeId == null) {
    return { ...calendar, periodId, periodName: calendar.periodName ?? periodName };
  }

  const line = mapCalendarToTimesheetLine(calendar);
  const employee = {
    employeeId,
    employeeNumber: calendar.employeeNumber ?? null,
    employeeName: calendar.employeeName ?? null,
  };

  return {
    ...calendar,
    periodId,
    periodName: calendar.periodName ?? periodName,
    dailyAttendance: (calendar.days ?? []).map((day) => ({
      date: day.date,
      dayOfWeek: day.dayOfWeek ?? null,
      dayName: day.dayName ?? null,
      employees: [
        {
          ...employee,
          statusCode: day.statusCode,
          statusName: day.statusName ?? null,
          plannedHours: day.plannedHours ?? null,
          workedHours: day.workedHours ?? day.workHours ?? null,
          scheduleId: day.scheduleId ?? null,
          absenceId: day.absenceId ?? null,
          absenceTypeId: day.absenceTypeId ?? null,
          absenceTypeCode: day.absenceTypeCode ?? null,
          absenceTypeName: day.absenceTypeName ?? null,
          timesheetCategory: day.timesheetCategory ?? null,
        },
      ],
    })),
    monthlySummary: [
      {
        ...employee,
        normWorkDays: line.normWorkDays ?? 0,
        normWorkHours: line.normWorkHours ?? 0,
        workedDays: line.workedDays ?? 0,
        workedHours: line.workedHours ?? 0,
        leaveDays: line.leaveDays ?? 0,
        sickDays: line.sickDays ?? 0,
        absentDays: line.absentDays ?? 0,
        overtimeHours: line.overtimeHours ?? 0,
      },
    ],
  };
};

export const mapMonthlySummaryToTimesheetLine = (
  summary: PayrollTimesheetMonthlySummary,
): Partial<PayrollTimesheetLineForm> => ({
  employeeId: summary.employeeId,
  employeeName: summary.employeeName ?? null,
  employeeNumber: summary.employeeNumber ?? null,
  normWorkDays: summary.normWorkDays ?? 0,
  normWorkHours: summary.normWorkHours ?? 0,
  workedDays: summary.workedDays ?? 0,
  workedHours: summary.workedHours ?? 0,
  leaveDays: summary.leaveDays ?? 0,
  sickDays: summary.sickDays ?? 0,
  absentDays: summary.absentDays ?? 0,
  overtimeHours: summary.overtimeHours ?? 0,
  note: summary.note ?? null,
});

export const mapCalendarSummaryToTimesheetLine = (
  calendar: PayrollTimesheetCalendar,
  summary: PayrollTimesheetMonthlySummary,
): Partial<PayrollTimesheetLineForm> => {
  const dailyRows = (calendar.dailyAttendance ?? []).flatMap((day) =>
    day.employees.filter((employee) => employee.employeeId === summary.employeeId),
  );
  const workedDays = dailyRows.filter(
    (row) => row.statusCode === "WORKED",
  ).length;
  const workedHours = dailyRows.reduce(
    (total, row) =>
      total + (row.statusCode === "WORKED" ? row.workedHours ?? 0 : 0),
    0,
  );

  return {
    ...mapMonthlySummaryToTimesheetLine(summary),
    workedDays:
      summary.workedDays && summary.workedDays > 0
        ? summary.workedDays
        : workedDays,
    workedHours:
      summary.workedHours && summary.workedHours > 0
        ? summary.workedHours
        : workedHours,
  };
};
