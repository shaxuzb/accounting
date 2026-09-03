import test from "node:test";
import assert from "node:assert/strict";
import { buildRegulatedObligationSettingPayload } from "../src/modules/settings/pages/regulatedObligationSettings/utils/payload.ts";

test("regulated obligation setting payload trims text and normalizes empty end date", () => {
  const payload = buildRegulatedObligationSettingPayload({
    regulatedObligationId: 7,
    periodicityId: 3,
    classifierCode: " 7 ",
    rate: 12,
    chartAccountId: 145,
    effectiveFrom: "2026-01-01",
    effectiveTo: "",
    stateId: 1,
  });

  assert.deepEqual(payload, {
    regulatedObligationId: 7,
    periodicityId: 3,
    classifierCode: "7",
    rate: 12,
    chartAccountId: 145,
    effectiveFrom: "2026-01-01",
    effectiveTo: null,
    stateId: 1,
  });
});
