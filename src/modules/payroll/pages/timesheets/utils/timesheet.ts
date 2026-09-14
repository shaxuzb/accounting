import dayjs from "dayjs";
import { DATE_TIME_FORMAT } from "../../../utils/format";
import type { PayrollTimesheetForm, PayrollTimesheetLineForm, PayrollTimesheetDayForm } from "../types/form";
import type { PayrollTimesheet, PayrollTimesheetCalendar, PayrollTimesheetDay, PayrollTimesheetMonthlySummary } from "../types/type";
import { calculateLineFromDays } from "./timesheetDayCalculator";
export { calculateLineFromDays, replaceLineDayStatus, replaceLineWorkedHours } from "./timesheetDayCalculator";

const normalizeTimesheetCategory = (
  value?: string | null,
): PayrollTimesheetDayForm["timesheetCategory"] =>
  value === "LEAVE" || value === "SICK" || value === "ABSENT" ? value : null;

const toDayForm = (day: PayrollTimesheetDay | { date: string; statusCode: string; statusName?: string | null; plannedHours?: number | null; workedHours?: number | null; overtimeHours?: number | null; nightHours?: number | null; holidayHours?: number | null; weekendHours?: number | null; absenceTypeId?: number | null; timesheetCategory?: "LEAVE" | "SICK" | "ABSENT" | null; sourceStatusCode?: string | null; sourceAbsenceId?: number | null; sourceScheduleId?: number | null; sourceAbsenceTypeId?: number | null; absenceTypeCode?: string | null; absenceTypeName?: string | null; isOverridden?: boolean }): PayrollTimesheetDayForm => ({
  date: day.date, statusCode: day.statusCode, statusName: day.statusName ?? null,
  sourceStatusCode: day.sourceStatusCode ?? day.statusCode, sourceAbsenceId: day.sourceAbsenceId ?? null,
  sourceScheduleId: day.sourceScheduleId ?? null, sourceAbsenceTypeId: day.sourceAbsenceTypeId ?? null,
  absenceTypeId: day.absenceTypeId ?? null, timesheetCategory: day.timesheetCategory ?? null,
  absenceTypeCode: day.absenceTypeCode ?? null, absenceTypeName: day.absenceTypeName ?? null,
  workedHours: day.workedHours ?? 0, plannedHours: day.plannedHours ?? 0,
  overtimeHours: day.overtimeHours ?? 0, nightHours: day.nightHours ?? 0,
  holidayHours: day.holidayHours ?? 0, weekendHours: day.weekendHours ?? 0,
  isOverridden: day.isOverridden ?? false,
});

export const createTimesheetLine = (overrides: Partial<PayrollTimesheetLineForm> = {}): PayrollTimesheetLineForm => ({ employeeId: null, employeeName: null, employeeNumber: null, normWorkDays: 0, normWorkHours: 0, workedDays: 0, workedHours: 0, leaveDays: 0, sickDays: 0, absentDays: 0, overtimeHours: 0, nightHours: 0, holidayHours: 0, weekendHours: 0, note: null, days: [], ...overrides });

export const createDefaultTimesheetForm = (periodId: number | null = null): PayrollTimesheetForm => ({ periodId, docDate: dayjs().format(DATE_TIME_FORMAT), note: null, lines: [] });

export const mapTimesheetToForm = (record?: PayrollTimesheet | null): PayrollTimesheetForm => !record ? createDefaultTimesheetForm() : ({ periodId: record.periodId ?? null, docDate: record.docDate ?? dayjs().format(DATE_TIME_FORMAT), note: record.note ?? null, lines: (record.lines ?? []).map((line) => createTimesheetLine({ employeeId: line.employeeId, employeeName: line.employeeName, employeeNumber: line.employeeNumber, normWorkDays: line.normWorkDays ?? record.normWorkDays ?? 0, normWorkHours: line.normWorkHours ?? record.normWorkHours ?? 0, workedDays: line.workedDays ?? 0, workedHours: line.workedHours ?? 0, leaveDays: line.leaveDays ?? 0, sickDays: line.sickDays ?? 0, absentDays: line.absentDays ?? 0, overtimeHours: line.overtimeHours ?? 0, nightHours: line.nightHours ?? 0, holidayHours: line.holidayHours ?? 0, weekendHours: line.weekendHours ?? 0, note: line.note ?? null, isLegacy: line.isLegacy, days: (line.days ?? []).map(toDayForm) })) });

export const summarizeTimesheet = (lines: PayrollTimesheetLineForm[], dailyWorkHours = 0) => lines.reduce((total, line) => {
  const derived = line.days.length ? calculateLineFromDays(line.days, dailyWorkHours) : line;
  return { employees: total.employees + 1, normWorkDays: total.normWorkDays + (line.normWorkDays ?? 0), normWorkHours: total.normWorkHours + (line.normWorkHours ?? 0), workedDays: total.workedDays + (derived.workedDays ?? 0), workedHours: total.workedHours + (derived.workedHours ?? 0), leaveDays: total.leaveDays + (derived.leaveDays ?? 0), sickDays: total.sickDays + (derived.sickDays ?? 0), absentDays: total.absentDays + (derived.absentDays ?? 0), overtimeHours: total.overtimeHours + (derived.overtimeHours ?? 0), nightHours: total.nightHours + (derived.nightHours ?? 0), holidayHours: total.holidayHours + (derived.holidayHours ?? 0), weekendHours: total.weekendHours + (derived.weekendHours ?? 0) };
}, { employees: 0, normWorkDays: 0, normWorkHours: 0, workedDays: 0, workedHours: 0, leaveDays: 0, sickDays: 0, absentDays: 0, overtimeHours: 0, nightHours: 0, holidayHours: 0, weekendHours: 0 });

export const mapCalendarToTimesheetLine = (calendar: PayrollTimesheetCalendar, dailyWorkHours = 0): Partial<PayrollTimesheetLineForm> => {
  const days = (calendar.days ?? []).map(toDayForm);
  const derived = calculateLineFromDays(days, dailyWorkHours);
  return { days, normWorkDays: calendar.summary?.normWorkDays ?? calendar.normWorkDays ?? 0, normWorkHours: calendar.summary?.normWorkHours ?? calendar.normWorkHours ?? 0, workedDays: derived.workedDays, workedHours: derived.workedHours, leaveDays: derived.leaveDays, sickDays: derived.sickDays, absentDays: derived.absentDays, overtimeHours: derived.overtimeHours, nightHours: derived.nightHours, holidayHours: derived.holidayHours, weekendHours: derived.weekendHours };
};

export const mapEmployeeCalendarToTimesheetCalendar = (calendar: PayrollTimesheetCalendar, periodId: number, periodName?: string | null): PayrollTimesheetCalendar => ({ ...calendar, periodId, periodName: calendar.periodName ?? periodName });

export const mapMonthlySummaryToTimesheetLine = (summary: PayrollTimesheetMonthlySummary): Partial<PayrollTimesheetLineForm> => ({ employeeId: summary.employeeId, employeeName: summary.employeeName ?? null, employeeNumber: summary.employeeNumber ?? null, normWorkDays: summary.normWorkDays ?? 0, normWorkHours: summary.normWorkHours ?? 0, workedDays: summary.workedDays ?? 0, workedHours: summary.workedHours ?? 0, leaveDays: summary.leaveDays ?? 0, sickDays: summary.sickDays ?? 0, absentDays: summary.absentDays ?? 0, overtimeHours: summary.overtimeHours ?? 0, nightHours: summary.nightHours ?? 0, holidayHours: summary.holidayHours ?? 0, weekendHours: summary.weekendHours ?? 0, note: summary.note ?? null, isLegacy: summary.isLegacy, days: (summary.days ?? []).map(toDayForm) });

export const mapCalendarSummaryToTimesheetLine = (
  calendar: PayrollTimesheetCalendar,
  summary: PayrollTimesheetMonthlySummary,
): Partial<PayrollTimesheetLineForm> => {
  const days = summary.days?.length
    ? summary.days.map(toDayForm)
    : (calendar.dailyAttendance ?? []).flatMap((attendance) => {
        const employee = attendance.employees.find(
          (item) => item.employeeId === summary.employeeId,
        );
        if (!employee) return [];
        return [{
          date: attendance.date,
          statusCode: employee.statusCode,
          statusName: employee.statusName ?? null,
          sourceStatusCode: employee.sourceStatusCode ?? employee.statusCode,
          sourceAbsenceId: employee.sourceAbsenceId ?? null,
          sourceScheduleId: employee.sourceScheduleId ?? null,
          sourceAbsenceTypeId: employee.sourceAbsenceTypeId ?? null,
          absenceTypeId: employee.absenceTypeId ?? null,
          absenceTypeCode: employee.absenceTypeCode ?? null,
          absenceTypeName: employee.absenceTypeName ?? null,
          timesheetCategory: normalizeTimesheetCategory(employee.timesheetCategory),
          workedHours: employee.workedHours ?? 0,
          plannedHours: employee.plannedHours ?? 0,
          overtimeHours: employee.overtimeHours ?? 0,
          nightHours: employee.nightHours ?? 0,
          holidayHours: employee.holidayHours ?? 0,
          weekendHours: employee.weekendHours ?? 0,
          isOverridden: employee.isOverridden ?? false,
        } satisfies PayrollTimesheetDayForm];
      });

  return {
    ...mapMonthlySummaryToTimesheetLine(summary),
    days,
  };
};

export const toTimesheetSavePayload = (form: PayrollTimesheetForm) => ({
  periodId: form.periodId,
  docDate: form.docDate,
  note: form.note,
    lines: form.lines.map((line) => ({
    employeeId: line.employeeId,
    overtimeHours: line.overtimeHours ?? 0,
    note: line.note,
    days: line.days.map((day) => ({
      date: day.date,
      statusCode: day.statusCode,
      absenceTypeId: day.absenceTypeId,
      workedHours: day.statusCode === "WORKED" ? day.workedHours ?? null : null,
      plannedHours: day.statusCode === "PLANNED_WORK" ? day.plannedHours ?? null : null,
      overtimeHours: day.overtimeHours ?? 0,
      nightHours: day.nightHours ?? 0,
      holidayHours: day.holidayHours ?? 0,
      weekendHours: day.weekendHours ?? 0,
    })),
  })),
});
