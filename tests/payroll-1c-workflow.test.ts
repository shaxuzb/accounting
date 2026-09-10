import assert from "node:assert/strict";
import test from "node:test";
import {
  payrollAttendanceTotal,
  payrollReconciliationVariance,
} from "../src/modules/payroll/pages/reports/utils/reconciliation.ts";

test("source-aware payroll payment reconciles to payable and outstanding", () => {
  assert.equal(
    payrollReconciliationVariance({
      payableAmount: 1_000,
      paidAmount: 600,
      outstandingAmount: 400,
    }),
    0,
  );
  assert.equal(
    payrollReconciliationVariance({
      payableAmount: 1_000,
      paidAmount: 700,
      outstandingAmount: 400,
    }),
    -100,
  );
});

test("attendance breakdown sums paid absence and special-hour snapshots", () => {
  assert.equal(payrollAttendanceTotal([2, 1.25, null, undefined]), 3.25);
});
