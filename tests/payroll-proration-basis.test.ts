import test from "node:test";
import assert from "node:assert/strict";
import { prorationBasisOptions } from "../src/modules/payroll/constants/options.ts";

test("proration basis exposes day and hour choices", () => {
  assert.deepEqual(
    prorationBasisOptions.map((option) => option.value),
    ["DAYS", "HOURS"],
  );
});
