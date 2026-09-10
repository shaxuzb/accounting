import test from "node:test";
import assert from "node:assert/strict";
import { calculateCalendarDayTotals, createPeriodCalendarDays } from "../src/modules/payroll/pages/periods/utils/periodCalendar.ts";

test("period calendar supports holidays and shortened workdays", () => {
  const days = createPeriodCalendarDays(2026, 9, 8);
  const holiday = days.find((day) => day.date === "2026-09-05")!;
  const workday = days.find((day) => day.date === "2026-09-01")!;

  holiday.dayType = "HOLIDAY";
  holiday.workHours = 0;
  workday.dayType = "SHORTENED";
  workday.workHours = 4;

  const totals = calculateCalendarDayTotals(days);

  assert.equal(holiday.isWorkDay, false);
  assert.equal(totals.normWorkDays, days.filter((day) => day.isWorkDay).length);
  assert.equal(totals.normWorkHours, days.filter((day) => day.isWorkDay).reduce((sum, day) => sum + day.workHours, 0));
});
