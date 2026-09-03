import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mapRentalContractToForm } from "../src/modules/rental/pages/contracts/utils/form.ts";

const addEditSource = readFileSync(
  new URL(
    "../src/modules/rental/pages/contracts/screens/ContractAddEditPage.tsx",
    import.meta.url,
  ),
  "utf8",
);
const routesSource = readFileSync(
  new URL("../src/modules/rental/routes.tsx", import.meta.url),
  "utf8",
);

test("maps a rental contract detail into the editable form shape", () => {
  const form = mapRentalContractToForm({
    id: 12,
    contractNumber: "IJ-012",
    contractDate: "2026-09-01T00:00:00",
    lessorFullName: "Lessor",
    lessorInn: "123",
    lessorPinfl: null,
    startDate: "2026-09-01T00:00:00",
    endDate: "2027-09-01T00:00:00",
    currencyId: 1,
    currencyCode: "UZS",
    statusId: 1,
    statusName: "Qoralama",
    objectCount: 1,
    lessorPayableAccountId: 101,
    taxPayableAccountId: 102,
    comment: "Office",
    objects: [
      {
        id: 44,
        rentalObjectTypeId: 2,
        objectName: "Room 1",
        objectIdentifier: "R1",
        objectAddress: "Tashkent",
        startDate: "2026-09-01T00:00:00",
        endDate: "2027-09-01T00:00:00",
        periodUnit: "MONTH",
        periodValue: 12,
        contractAmount: 1000,
        taxBaseAmount: 900,
        taxRate: 12,
        expenseAccountId: 103,
      },
    ],
  });

  assert.deepEqual(form, {
    lessorFullName: "Lessor",
    lessorInn: "123",
    lessorPinfl: null,
    contractNumber: "IJ-012",
    contractDate: "2026-09-01T00:00:00",
    startDate: "2026-09-01T00:00:00",
    endDate: "2027-09-01T00:00:00",
    currencyId: 1,
    lessorPayableAccountId: 101,
    taxPayableAccountId: 102,
    comment: "Office",
    objects: [
      {
        id: 44,
        rentalObjectTypeId: 2,
        objectName: "Room 1",
        objectIdentifier: "R1",
        objectAddress: "Tashkent",
        startDate: "2026-09-01T00:00:00",
        endDate: "2027-09-01T00:00:00",
        periodUnit: "MONTH",
        periodValue: 12,
        contractAmount: 1000,
        taxBaseAmount: 900,
        taxRate: 12,
        expenseAccountId: 103,
      },
    ],
  });
});

test("rental create form uses the shared sticky draft actions bar", () => {
  assert.match(addEditSource, /import DraftActionsBar/);
  assert.match(addEditSource, /<DraftActionsBar[\s\S]*?\bisCreate\b/);
});

test("rental edit route uses the status-aware detail form", () => {
  const editRoute = routesSource.match(
    /path: "edit\/:id"([\s\S]*?)handle: \{/,
  )?.[1];

  assert.ok(editRoute, "Missing rental edit route");
  assert.match(
    editRoute,
    /element: withPermission\(\s*<ContractDetailPage \/>/,
  );
  assert.doesNotMatch(editRoute, /<ContractAddEditPage \/>/);
});
