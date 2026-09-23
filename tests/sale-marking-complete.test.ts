import assert from "node:assert/strict";
import test from "node:test";
import {
  getIncompleteSaleMarkingLines,
  isSaleMarkingComplete,
} from "../src/modules/sale/pages/sale/utils/saleMarkings.ts";

const marked = (quantity: number, codes: number, unmarkedQuantity = 0) => ({
  productId: 1,
  productName: "Test tovar M",
  quantity,
  costPrice: 0,
  unitId: 1,
  unitPrice: 0,
  isPieceTracked: true,
  unmarkedQuantity,
  markings: Array.from({ length: codes }, (_, index) => ({
    markingNumber: `CODE-${index}`,
    productTableId: index + 1,
    batchId: 1,
  })),
});

test("every unit scanned or stated code-less completes a marked line", () => {
  assert.equal(isSaleMarkingComplete(marked(3, 3)), true);
  assert.equal(isSaleMarkingComplete(marked(3, 1, 2)), true);
  assert.equal(isSaleMarkingComplete(marked(3, 0, 3)), true);
});

test("a forgotten scan is not filled in: the line stays incomplete", () => {
  assert.equal(isSaleMarkingComplete(marked(3, 2)), false);
  assert.equal(isSaleMarkingComplete(marked(3, 0)), false);
  assert.equal(isSaleMarkingComplete(marked(3, 2, 2)), false);
  assert.equal(isSaleMarkingComplete(marked(0, 0)), false);
});

test("goods kept by quantity need no codes", () => {
  assert.equal(
    isSaleMarkingComplete({ ...marked(5, 0), isPieceTracked: false }),
    true,
  );
});

test("only the incomplete lines are reported", () => {
  const lines = [
    marked(1, 1),
    { ...marked(2, 0), productName: "B" },
    { ...marked(4, 0), isPieceTracked: false },
  ];
  assert.deepEqual(
    getIncompleteSaleMarkingLines(lines).map((line) => line.productName),
    ["B"],
  );
});
