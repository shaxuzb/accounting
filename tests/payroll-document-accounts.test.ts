import assert from "node:assert/strict";
import test from "node:test";
import { payrollDocumentAccountFields } from "../src/modules/payroll/pages/documents/constants/accounts.ts";

test("payroll document account fields keep only salary accounts", () => {
  assert.deepEqual(
    payrollDocumentAccountFields.map((field) => field.fieldName),
    ["salaryExpenseAccountId", "salaryPayableAccountId"],
  );
});
