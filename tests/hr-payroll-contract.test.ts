import assert from "node:assert/strict";
import test from "node:test";
import {
  getHrOrderFieldConfig,
  validateHrOrderTarget,
} from "../src/modules/hr/pages/orders/utils/order.ts";
import { normalizeManualAdjustment } from "../src/modules/payroll/pages/documents/utils/correction.ts";
import { mapAdvanceSuggestionToPaymentLines } from "../src/modules/payroll/pages/payments/utils/advanceSuggestion.ts";

test("HR order field config hides target fields for dismissal", () => {
  assert.deepEqual(getHrOrderFieldConfig("DISMISSAL"), {
    showDepartment: false,
    showPosition: false,
    showEmployment: false,
    showSalary: false,
    showRate: false,
    showWeeklyHours: false,
    showCurrency: false,
    showExpenseAccount: false,
    showAdvance: false,
  });
});

test("transfer order requires a department or position", () => {
  assert.equal(
    validateHrOrderTarget({ orderType: "TRANSFER", departmentId: null, positionId: null })
      .valid,
    false,
  );
  assert.equal(
    validateHrOrderTarget({ orderType: "TRANSFER", departmentId: 4, positionId: null })
      .valid,
    true,
  );
});

test("manual correction emits exactly one amount mode", () => {
  assert.deepEqual(
    normalizeManualAdjustment({
      employeeId: 1,
      componentId: 7,
      mode: "TARGET",
      value: 1250,
      note: "updated",
    }),
    {
      employeeId: 1,
      componentId: 7,
      amount: undefined,
      targetAmount: 1250,
      note: "updated",
    },
  );
});

test("advance suggestions become editable payment lines", () => {
  assert.deepEqual(
    mapAdvanceSuggestionToPaymentLines([
      {
        employeeId: 1,
        employeeNumber: "E-1",
        employeeName: "Ada Lovelace",
        advanceMethod: "PERCENT",
        advanceValue: 40,
        baseAdvance: 1000,
        correctionAmount: 100,
        suggested: 1100,
      },
    ]),
    [
      {
        employeeId: 1,
        employeeName: "Ada Lovelace",
        employeeNumber: "E-1",
        departmentName: null,
        payableAmount: null,
        amount: 1100,
        note: null,
      },
    ],
  );
});
