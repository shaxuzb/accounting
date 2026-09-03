import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCashQuery,
  buildElectronicDocumentsQuery,
  buildOverviewQuery,
  buildTaxSummaryQuery,
} from "../src/modules/dashboard/api/query.ts";

test("overview query repeats currency ids and omits empty values", () => {
  const params = buildOverviewQuery({
    dateFrom: "2026-01-01",
    dateTo: "2026-09-03",
    currencyIds: [1, 2],
  });

  assert.equal(
    params.toString(),
    "dateFrom=2026-01-01&dateTo=2026-09-03&currencyIds=1&currencyIds=2",
  );
});

test("cash query accepts only overview filters", () => {
  const params = buildCashQuery({
    dateFrom: "2026-01-01",
    dateTo: "2026-09-03",
    currencyIds: [],
  });

  assert.deepEqual([...params.keys()], ["dateFrom", "dateTo"]);
});

test("electronic-document query does not leak currency filters", () => {
  const params = buildElectronicDocumentsQuery({
    dateFrom: "2026-01-01",
    dateTo: "2026-09-03",
    documentTypes: ["FACTURA", "WAYBILL_LOCAL"],
    statusIds: [1, 2],
  });

  assert.equal(
    params.toString(),
    "dateFrom=2026-01-01&dateTo=2026-09-03&documentTypes=FACTURA&documentTypes=WAYBILL_LOCAL&statusIds=1&statusIds=2",
  );
  assert.equal(params.has("currencyIds"), false);
});

test("tax query serializes document types independently", () => {
  const params = buildTaxSummaryQuery({
    dateFrom: "2026-01-01",
    dateTo: "2026-09-03",
    currencyIds: [1],
    documentTypes: ["SALE", "PURCHASE"],
  });

  assert.equal(
    params.toString(),
    "dateFrom=2026-01-01&dateTo=2026-09-03&currencyIds=1&documentTypes=SALE&documentTypes=PURCHASE",
  );
});
