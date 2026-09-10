import assert from "node:assert/strict";
import test from "node:test";

import {
  calculatePeriodTotals,
  proposeWeekdayWorkDates,
  toggleWorkDate,
} from "../src/modules/payroll/pages/periods/utils/periodCalendar.ts";

test("totals use unique selected dates", () => {
  assert.deepEqual(
    calculatePeriodTotals(["2026-09-01", "2026-09-01", "2026-09-02"], 8),
    { normWorkDays: 2, normWorkHours: 16 },
  );
});

test("toggle keeps dates sorted", () => {
  assert.deepEqual(toggleWorkDate(["2026-09-03"], "2026-09-01"), [
    "2026-09-01",
    "2026-09-03",
  ]);
});

test("weekday proposal excludes weekends", () => {
  assert.deepEqual(proposeWeekdayWorkDates(2026, 2), [
    "2026-02-02",
    "2026-02-03",
    "2026-02-04",
    "2026-02-05",
    "2026-02-06",
    "2026-02-09",
    "2026-02-10",
    "2026-02-11",
    "2026-02-12",
    "2026-02-13",
    "2026-02-16",
    "2026-02-17",
    "2026-02-18",
    "2026-02-19",
    "2026-02-20",
    "2026-02-23",
    "2026-02-24",
    "2026-02-25",
    "2026-02-26",
    "2026-02-27",
  ]);
});
