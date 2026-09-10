import assert from "node:assert/strict";
import test from "node:test";
import { calculateLineFromDays, replaceLineDayStatus, replaceLineWorkedHours } from "../src/modules/payroll/pages/timesheets/utils/timesheetDayCalculator.ts";

test("worked totals use fixed period hours", () => {
  const totals = calculateLineFromDays([
    { date: "2026-09-01", statusCode: "WORKED", absenceTypeId: null, timesheetCategory: null },
    { date: "2026-09-02", statusCode: "WORKED", absenceTypeId: null, timesheetCategory: null },
    { date: "2026-09-03", statusCode: "DAY_OFF", absenceTypeId: null, timesheetCategory: null },
  ], 8);
  assert.equal(totals.workedDays, 2);
  assert.equal(totals.workedHours, 16);
});

test("worked totals use entered hours while defaulting missing hours to the period maximum", () => {
  const totals = calculateLineFromDays([
    { date: "2026-09-01", statusCode: "WORKED", workedHours: 4, absenceTypeId: null, timesheetCategory: null },
    { date: "2026-09-02", statusCode: "WORKED", workedHours: 3, absenceTypeId: null, timesheetCategory: null },
    { date: "2026-09-03", statusCode: "WORKED", absenceTypeId: null, timesheetCategory: null },
  ], 8);
  assert.equal(totals.workedDays, 3);
  assert.equal(totals.workedHours, 15);
});

test("status replacement changes only one date", () => {
  const changed = replaceLineDayStatus(
    [{ date: "2026-09-01", statusCode: "WORKED", absenceTypeId: null, timesheetCategory: null }],
    "2026-09-01",
    { code: "SICK_LEAVE", name: "Sick", kind: "ABSENCE", absenceTypeId: 2, timesheetCategory: "SICK" },
  );
  assert.equal(changed[0].statusCode, "SICK_LEAVE");
  assert.equal(changed[0].timesheetCategory, "SICK");
});

test("worked hour editing changes only the selected worked date", () => {
  const changed = replaceLineWorkedHours(
    [
      { date: "2026-09-01", statusCode: "WORKED", workedHours: 8, absenceTypeId: null },
      { date: "2026-09-02", statusCode: "WORKED", workedHours: 8, absenceTypeId: null },
    ],
    "2026-09-01",
    4,
  );
  assert.equal(changed[0].workedHours, 4);
  assert.equal(changed[1].workedHours, 8);
  assert.equal(calculateLineFromDays(changed, 8).workedHours, 12);
});
