import test from "node:test";
import assert from "node:assert/strict";
import { buildContractPayload } from "../src/modules/rental/pages/contracts/utils/payload.ts";
import { createRentalContractDefaults } from "../src/modules/rental/pages/contracts/utils/defaults.ts";
import { mapRentalContractToForm } from "../src/modules/rental/pages/contracts/utils/form.ts";
import { rentalContractSchema } from "../src/modules/rental/pages/contracts/types/schema.ts";
import { normalizeRentalContractForMode } from "../src/modules/rental/pages/contracts/utils/mode.ts";
import { formatRentalLessors } from "../src/modules/rental/pages/contracts/utils/lessor.ts";
import { rentalAccrualSchema } from "../src/modules/rental/pages/accruals/types/schema.ts";
import { buildGenerateDuePayload } from "../src/modules/rental/pages/accruals/utils/payload.ts";

test("contract payload sends sanitized lessors and date-only values", () => {
  const payload = buildContractPayload(
    {
      organizationId: 2,
      isFreeOfCharge: false,
      contractNumber: "IJ-001",
      contractDate: "2026-09-04T00:00:00",
      startDate: "2026-09-04T00:00:00",
      endDate: "2027-09-03T00:00:00",
      lessors: [
        {
          id: 8,
          counterpartyId: 12,
          lessorKindCode: "LEGAL_ENTITY",
          fullName: "ACME LLC",
          inn: "301111111",
          pinfl: null,
          phoneNumber: "+998901234567",
          registeredAddress: "Tashkent",
          residentialAddress: null,
        },
      ],
      objects: [
        {
          id: 19,
          nextAccrualDate: "2026-09-04T00:00:00",
          rentalObjectTypeId: 1,
          objectName: "Office",
          startDate: "2026-09-04T00:00:00",
          endDate: "2027-09-03T00:00:00",
          totalArea: 48.22,
          rentedArea: 20,
          periodUnit: "MONTH",
          periodValue: 1,
          contractAmount: 5000000,
          taxBaseAmount: 6000000,
          taxRate: 12,
          expenseAccountId: 200,
          utilities: [{ utilityServiceId: 1, payerCode: "LESSOR" }],
        },
      ],
    },
    { includeObjectIds: true },
  );

  assert.equal("organizationId" in payload, false);
  assert.equal("lessorFullName" in payload, false);
  assert.equal(payload.contractDate, "2026-09-04");
  assert.deepEqual(payload.lessors, [
    {
      lessorKindCode: "LEGAL_ENTITY",
      fullName: "ACME LLC",
      inn: "301111111",
      pinfl: null,
      phoneNumber: "+998901234567",
      registeredAddress: "Tashkent",
      residentialAddress: null,
    },
  ]);
  assert.equal(
    (payload.objects as Array<Record<string, unknown>>)[0].id,
    19,
  );
  assert.equal(
    (payload.objects as Array<Record<string, unknown>>)[0].startDate,
    "2026-09-04",
  );
});

test("new contract defaults start with one lessor and paid rental mode", () => {
  const defaults = createRentalContractDefaults("2026-09-04", "2027-09-03");

  assert.equal(defaults.isFreeOfCharge, false);
  assert.equal(defaults.lessors.length, 1);
  assert.equal(defaults.lessors[0].lessorKindCode, "INDIVIDUAL");
  assert.deepEqual(defaults.objects[0].utilities, []);
  assert.equal(defaults.objects[0].totalArea, null);
  assert.equal(defaults.objects[0].rentedArea, null);
});

test("detail mapper keeps all lessors, areas, and utilities", () => {
  const form = mapRentalContractToForm({
    id: 15,
    contractNumber: "IJ-001",
    contractDate: "2026-09-04T00:00:00",
    isFreeOfCharge: false,
    startDate: "2026-09-04T00:00:00",
    endDate: "2027-09-03T00:00:00",
    currencyId: 1,
    currencyCode: "UZS",
    statusId: 1,
    statusName: "Draft",
    objectCount: 1,
    lessors: [
      {
        id: 8,
        lessorKindCode: "INDIVIDUAL",
        counterpartyId: null,
        fullName: "Ali Valiyev",
        inn: "301111111",
        pinfl: "12345678901234",
        phoneNumber: "+998901234567",
        registeredAddress: "Navoiy",
        residentialAddress: "Navoiy shahri",
      },
    ],
    objects: [
      {
        id: 19,
        rentalObjectTypeId: 1,
        objectName: "Office",
        objectIdentifier: "21:09",
        objectAddress: "Navoiy",
        totalArea: 48.22,
        rentedArea: 20,
        startDate: "2026-09-04T00:00:00",
        endDate: "2027-09-03T00:00:00",
        periodUnit: "MONTH",
        periodValue: 1,
        contractAmount: 5000000,
        taxBaseAmount: 6000000,
        taxRate: 12,
        expenseAccountId: 200,
        utilities: [
          {
            utilityServiceId: 1,
            payerCode: "LESSOR",
            utilityServiceCode: "NATURAL_GAS",
            utilityServiceName: "Tabiiy gaz",
          },
        ],
      },
    ],
  });

  assert.equal(form.isFreeOfCharge, false);
  assert.deepEqual(form.lessors[0], {
    lessorKindCode: "INDIVIDUAL",
    fullName: "Ali Valiyev",
    inn: "301111111",
    pinfl: "12345678901234",
    phoneNumber: "+998901234567",
    registeredAddress: "Navoiy",
    residentialAddress: "Navoiy shahri",
  });
  assert.equal(form.objects[0].totalArea, 48.22);
  assert.equal(form.objects[0].rentedArea, 20);
  assert.deepEqual(form.objects[0].utilities, [
    { utilityServiceId: 1, payerCode: "LESSOR" },
  ]);
});

test("free rental values are accepted by the contract schema", async () => {
  await assert.doesNotReject(
    rentalContractSchema.validate({
      isFreeOfCharge: true,
      contractNumber: "IJ-FREE-001",
      contractDate: "2026-09-04",
      startDate: "2026-09-04",
      endDate: "2027-09-03",
      currencyId: 1,
      lessorPayableAccountId: null,
      taxPayableAccountId: null,
      comment: "",
      lessors: [
        {
          lessorKindCode: "INDIVIDUAL",
          fullName: "Ali Valiyev",
          inn: null,
          pinfl: "12345678901234",
          phoneNumber: null,
          registeredAddress: null,
          residentialAddress: null,
        },
      ],
      objects: [
        {
          id: null,
          rentalObjectTypeId: 1,
          objectName: "Office",
          objectIdentifier: "",
          objectAddress: "",
          totalArea: null,
          rentedArea: null,
          startDate: "2026-09-04",
          endDate: "2027-09-03",
          periodUnit: "MONTH",
          periodValue: 1,
          contractAmount: 0,
          taxBaseAmount: 0,
          taxRate: 0,
          expenseAccountId: null,
          utilities: [],
        },
      ],
    }),
  );
});

test("free rental mode clears monetary and account fields", () => {
  const result = normalizeRentalContractForMode({
    isFreeOfCharge: true,
    lessorPayableAccountId: 210,
    taxPayableAccountId: 220,
    objects: [
      {
        contractAmount: 5000000,
        taxBaseAmount: 6000000,
        taxRate: 12,
        expenseAccountId: 200,
        utilities: [],
      },
    ],
  });

  assert.equal(result.lessorPayableAccountId, null);
  assert.equal(result.taxPayableAccountId, null);
  assert.deepEqual(result.objects[0], {
    contractAmount: 0,
    taxBaseAmount: 0,
    taxRate: 0,
    expenseAccountId: null,
    utilities: [],
  });
});

test("lessor display formatter supports multiple lessors", () => {
  assert.equal(
    formatRentalLessors([
      { fullName: "Ali Valiyev" },
      { fullName: "ACME LLC" },
    ]),
    "Ali Valiyev, ACME LLC",
  );
});

test("accrual draft requires a positive exchange rate", async () => {
  await assert.rejects(
    rentalAccrualSchema.validate({
      exchangeRate: 0,
      lessorPayableAccountId: null,
      taxPayableAccountId: null,
      comment: "",
      items: [],
    }),
    /greater than zero/i,
  );
});

test("generate-due payload sends year and month", () => {
  assert.deepEqual(buildGenerateDuePayload("2026-09-04"), {
    year: 2026,
    month: 9,
  });
});
