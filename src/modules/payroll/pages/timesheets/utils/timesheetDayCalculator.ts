import type { PayrollTimesheetDayForm } from "../types/form";
import type { PayrollAttendanceStatusOption } from "../types/type";

export const calculateLineFromDays = (days: PayrollTimesheetDayForm[], dailyWorkHours: number) => {
  const workedDays = days.filter((day) => day.statusCode === "WORKED").length;
  const plannedWorkDays = days.filter((day) => day.statusCode === "PLANNED_WORK").length;
  const leaveDays = days.filter((day) => day.timesheetCategory === "LEAVE").length;
  const sickDays = days.filter((day) => day.timesheetCategory === "SICK").length;
  const absentDays = days.filter((day) => day.timesheetCategory === "ABSENT").length;
  const overtimeHours = days.reduce((total, day) => total + (day.overtimeHours ?? 0), 0);
  const nightHours = days.reduce((total, day) => total + (day.nightHours ?? 0), 0);
  const holidayHours = days.reduce((total, day) => total + (day.holidayHours ?? 0), 0);
  const weekendHours = days.reduce((total, day) => total + (day.weekendHours ?? 0), 0);
  const workedHours = days
    .filter((day) => day.statusCode === "WORKED")
    .reduce((total, day) => total + (day.workedHours && day.workedHours >= 1 ? day.workedHours : dailyWorkHours), 0);
  const plannedWorkHours = days
    .filter((day) => day.statusCode === "PLANNED_WORK")
    .reduce((total, day) => total + (day.plannedHours ?? dailyWorkHours), 0);
  return { workedDays, workedHours: Math.round(workedHours * 100) / 100, leaveDays, sickDays, absentDays, plannedWorkDays, plannedWorkHours: Math.round(plannedWorkHours * 100) / 100, overtimeHours, nightHours, holidayHours, weekendHours };
};

export const replaceLineDayStatus = (days: PayrollTimesheetDayForm[], date: string, option: PayrollAttendanceStatusOption, dailyWorkHours = 0) => days.map((day) => day.date === date ? {
  ...day,
  statusCode: option.code,
  statusName: option.name,
  absenceTypeId: option.kind === "ABSENCE" ? option.absenceTypeId ?? null : null,
  timesheetCategory: option.kind === "ABSENCE" ? option.timesheetCategory ?? null : null,
  absenceTypeCode: option.kind === "ABSENCE" ? option.code : null,
  absenceTypeName: option.kind === "ABSENCE" ? option.name : null,
  workedHours: option.code === "WORKED" ? (day.workedHours && day.workedHours >= 1 ? day.workedHours : dailyWorkHours) : 0,
  plannedHours: option.code === "PLANNED_WORK" ? day.plannedHours : 0,
  overtimeHours: option.code === "WORKED" ? day.overtimeHours ?? 0 : 0,
  nightHours: option.code === "WORKED" ? day.nightHours ?? 0 : 0,
  holidayHours: option.code === "WORKED" ? day.holidayHours ?? 0 : 0,
  weekendHours: option.code === "WORKED" ? day.weekendHours ?? 0 : 0,
  isOverridden: option.code !== (day.sourceStatusCode ?? day.statusCode) || (option.absenceTypeId ?? null) !== (day.sourceAbsenceTypeId ?? null),
} : day);

export const replaceLineWorkedHours = (days: PayrollTimesheetDayForm[], date: string, workedHours: number) =>
  days.map((day) => day.date === date ? { ...day, workedHours } : day);
