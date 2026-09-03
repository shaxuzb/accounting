import test from "node:test";
import assert from "node:assert/strict";
import {
  formatDashboardAmount,
  getSourceStatusMeta,
  getDashboardDocumentLabel,
  getDashboardDocumentStatusLabel,
  isUnavailableAmount,
} from "../src/modules/dashboard/utils/dashboard.ts";

test("source status metadata explains partial data", () => {
  assert.deepEqual(getSourceStatusMeta("PARTIAL"), {
    label: "Qisman ma'lumot",
    tone: "warning",
  });
});

test("unknown source statuses fail safe to unavailable", () => {
  assert.deepEqual(getSourceStatusMeta("SOMETHING_NEW"), {
    label: "Manba mavjud emas",
    tone: "danger",
  });
});

test("nullable overdue is treated as unavailable, not zero", () => {
  assert.equal(isUnavailableAmount(null), true);
  assert.equal(isUnavailableAmount(0), false);
});

test("UZS amount formatting is compact and localized", () => {
  assert.equal(formatDashboardAmount(1250000, "UZS"), "1 250 000 so‘m");
});

test("amounts without a currency code stay currency-neutral", () => {
  assert.equal(formatDashboardAmount(1250000, ""), "1 250 000");
});

test("document types use product-friendly dashboard labels", () => {
  assert.equal(getDashboardDocumentLabel("FACTURA"), "Hisob-fakturalar");
  assert.equal(getDashboardDocumentLabel("WAYBILL"), "TTYu");
  assert.equal(getDashboardDocumentLabel("WAYBILL_LOCAL"), "TTYu");
  assert.equal(getDashboardDocumentLabel("CUSTOM_TYPE"), "CUSTOM_TYPE");
});

test("document statuses use product-friendly dashboard labels", () => {
  assert.equal(getDashboardDocumentStatusLabel("SIGNED"), "Tasdiqlandi");
  assert.equal(getDashboardDocumentStatusLabel("SENT"), "Jarayonda");
  assert.equal(getDashboardDocumentStatusLabel("UNKNOWN"), "UNKNOWN");
});
