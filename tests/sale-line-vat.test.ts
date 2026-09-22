import assert from "node:assert/strict";
import test from "node:test";
import {
  getLayerTotal,
  getLineNetAmount,
  getLineTotal,
  getLineVatAmount,
  getNetUnitPriceFromTotal,
} from "../src/modules/sale/pages/sale/utils/lineVat.ts";

const vatRates = [
  { id: 1, name: "QQS 0%" },
  { id: 3, name: "QQS 12%" },
];

const line = (overrides) => ({
  productId: 1,
  productName: "Tovar",
  quantity: 1,
  availableQuantity: 10,
  costPrice: 0,
  unitId: 1,
  unitPrice: 0,
  inventoryAccountId: null,
  incomeAccountId: null,
  costAccountId: null,
  vatRateId: 3,
  ...overrides,
});

test("QQS sotuv narxi ustiga qo'shiladi, undan ajratilmaydi", () => {
  const sale = line({ unitPrice: 2_240_000, quantity: 1 });

  assert.equal(getLineNetAmount(sale), 2_240_000);
  assert.equal(getLineVatAmount(sale, vatRates), 268_800);
  assert.equal(getLineTotal(sale, vatRates), 2_508_800);
});

test("satr jami miqdorga ko'paytiriladi", () => {
  const sale = line({ unitPrice: 2_000_000, quantity: 3 });

  assert.equal(getLineNetAmount(sale), 6_000_000);
  assert.equal(getLineVatAmount(sale, vatRates), 720_000);
  assert.equal(getLineTotal(sale, vatRates), 6_720_000);
});

test("QQS 0% da jami QQSsiz summaga teng", () => {
  const sale = line({ unitPrice: 2_000_000, quantity: 2, vatRateId: 1 });

  assert.equal(getLineVatAmount(sale, vatRates), 0);
  assert.equal(getLineTotal(sale, vatRates), 4_000_000);
});

test("QQS stavkasi tanlanmagan satrda QQS hisoblanmaydi", () => {
  const sale = line({ unitPrice: 1_000_000, quantity: 1, vatRateId: null });

  assert.equal(getLineVatAmount(sale, vatRates), 0);
  assert.equal(getLineTotal(sale, vatRates), 1_000_000);
});

test("QQS bilan kiritilgan jamidan QQSsiz dona narxi chiqariladi", () => {
  assert.equal(getNetUnitPriceFromTotal(2_508_800, 1, 3, vatRates), 2_240_000);
  assert.equal(getNetUnitPriceFromTotal(6_720_000, 3, 3, vatRates), 2_000_000);
  assert.equal(getNetUnitPriceFromTotal(4_000_000, 2, 1, vatRates), 2_000_000);
});

test("miqdor 0 bo'lganda dona narxi 0 qaytariladi", () => {
  assert.equal(getNetUnitPriceFromTotal(2_508_800, 0, 3, vatRates), 0);
  assert.equal(getNetUnitPriceFromTotal(2_508_800, null, 3, vatRates), 0);
});

test("partiya jamisi ham QQSni narx ustiga qo'shadi", () => {
  const layer = { salePrice: 1_500_000, writeOffQuantity: 2 };

  assert.equal(getLayerTotal(layer, 3, vatRates), 3_360_000);
});
