import test from "node:test";
import assert from "node:assert/strict";
import { buildContractPayload } from "../src/modules/rental/pages/contracts/utils/payload.ts";

test("create rental contract payload does not contain ids", () => {
  const payload = buildContractPayload(
    {
      id: 77,
      contractNumber: "IJ-001",
      objects: [
        {
          id: null,
          objectName: "Office",
          nextAccrualDate: "2026-10-01",
        },
      ],
    },
    { includeObjectIds: false },
  );

  assert.equal("id" in payload, false);
  assert.equal("id" in (payload.objects as Array<Record<string, unknown>>)[0], false);
});

test("update rental contract payload keeps existing object ids", () => {
  const payload = buildContractPayload(
    {
      objects: [{ id: 15, objectName: "Office" }],
    },
    { includeObjectIds: true },
  );

  assert.equal(
    (payload.objects as Array<Record<string, unknown>>)[0].id,
    15,
  );
});
