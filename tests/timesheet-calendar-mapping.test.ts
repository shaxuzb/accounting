import test from "node:test";
import assert from "node:assert/strict";
import { calculateLineFromDays } from "../src/modules/payroll/pages/timesheets/utils/timesheetDayCalculator.ts";

test("employee calendar mapping keeps employee norms and daily planned hours", () => {
  const line = [
    { date: "2026-09-01", statusCode: "WORKED", workedHours: 4, plannedHours: 8 },
    { date: "2026-09-02", statusCode: "PLANNED_WORK", workedHours: 0, plannedHours: 4 },
  ];

  const result = calculateLineFromDays(line, 8);

  assert.equal(result.workedHours, 4);
  assert.equal(result.plannedWorkHours, 4);
});
