import dayjs, { type Dayjs } from "dayjs";
import type { PayrollPeriodCalendarDayForm, PayrollPeriodDayType } from "../types/form";

/**
 * The period form stores year/month separately because that is what the API
 * accepts, while the UI exposes one month picker. Keeping the conversion here
 * makes the picker and the calendar use the same source of truth.
 */
export const getPeriodMonthValue = (year?: number | null, month?: number | null) => {
  if (!year || !month || month < 1 || month > 12) return null;
  return dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
};

export const getPeriodMonthValueFromPeriod = (period: {
  year?: number | null;
  month?: number | null;
  startDate?: string | null;
}) =>
  getPeriodMonthValue(period.year, period.month) ??
  (period.startDate ? dayjs(period.startDate).startOf("month") : null);

export const periodMonthToYearMonth = (value: Dayjs | null) =>
  value ? { year: value.year(), month: value.month() + 1 } : { year: null, month: null };

export const calculatePeriodTotals = (dates: string[], hours: number | null) => {
  const normWorkDays = new Set(dates).size;
  return {
    normWorkDays,
    normWorkHours: Math.round(normWorkDays * (hours ?? 0) * 100) / 100,
  };
};

export const toggleWorkDate = (dates: string[], date: string) =>
  dates.includes(date)
    ? dates.filter((item) => item !== date)
    : [...dates, date].sort();

/**
 * Uzbekistan's fixed public holidays (MM-DD), days off whatever the weekday, as 1C's
 * production calendar has them: New Year, Women's Day, Navruz, Remembrance Day,
 * Independence Day, Teachers' Day, Constitution Day. The two Hayit days move every year
 * (set by decree) and are marked by hand.
 */
export const UZ_FIXED_HOLIDAYS = ["01-01", "03-08", "03-21", "05-09", "09-01", "10-01", "12-08"];

const isFixedHoliday = (date: Dayjs) => UZ_FIXED_HOLIDAYS.includes(date.format("MM-DD"));
const isWorkingWeekday = (date: Dayjs) =>
  date.day() !== 0 && date.day() !== 6 && !isFixedHoliday(date);

export const proposeWeekdayWorkDates = (year: number, month: number) => {
  const start = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
  return Array.from({ length: start.daysInMonth() }, (_, index) =>
    start.add(index, "day"),
  )
    .filter(isWorkingWeekday)
    .map((date) => date.format("YYYY-MM-DD"));
};

export const createPeriodCalendarDays = (
  year: number,
  month: number,
  dailyWorkHours: number,
): PayrollPeriodCalendarDayForm[] => {
  const start = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
  return Array.from({ length: start.daysInMonth() }, (_, index) => {
    const date = start.add(index, "day");
    const isWeekday = isWorkingWeekday(date);
    // the working day before a public holiday is one hour shorter (Labour Code)
    const isEve = isWeekday && isFixedHoliday(date.add(1, "day"));
    const hours = isEve ? Math.max(dailyWorkHours - 1, 0) : dailyWorkHours;
    return {
      date: date.format("YYYY-MM-DD"),
      dayType: (isWeekday ? (isEve ? "SHORTENED" : "NORMAL") : "HOLIDAY") as PayrollPeriodDayType,
      workHours: isWeekday ? hours : 0,
      isWorkDay: isWeekday,
    };
  });
};

export const calculateCalendarDayTotals = (days: PayrollPeriodCalendarDayForm[]) => {
  const workDays = days.filter((day) => day.isWorkDay && day.workHours > 0);
  return {
    normWorkDays: workDays.length,
    normWorkHours: Math.round(workDays.reduce((sum, day) => sum + day.workHours, 0) * 100) / 100,
  };
};

export const calendarDaysToWorkDates = (days: PayrollPeriodCalendarDayForm[]) =>
  days.filter((day) => day.isWorkDay && day.workHours > 0).map((day) => day.date).sort();

export const updatePeriodCalendarDay = (
  days: PayrollPeriodCalendarDayForm[],
  date: string,
  dayType: PayrollPeriodDayType,
  workHours: number,
) => days.map((day) => day.date === date
  ? { ...day, dayType, workHours: dayType === "HOLIDAY" ? 0 : workHours, isWorkDay: dayType !== "HOLIDAY" && workHours > 0 }
  : day);

export const updateNormalCalendarDayHours = (
  days: PayrollPeriodCalendarDayForm[],
  dailyWorkHours: number,
) => days.map((day) => day.dayType === "NORMAL"
  ? { ...day, workHours: dailyWorkHours, isWorkDay: dailyWorkHours > 0 }
  : day);
