import assert from "node:assert/strict";
import test from "node:test";
import {
  toCreatePayload,
  toUpdatePayload,
} from "../src/modules/warehouse/pages/products/types/form.ts";
import { productItemSchema } from "../src/modules/warehouse/pages/products/types/schema.ts";

const item = (overrides = {}) => ({
  id: 55,
  idIndex: 1,
  name: "Kondensator",
  unitId: 1,
  mxik: "07321001010001058",
  description: "",
  isService: false,
  isPieceTracked: true,
  isSold: true,
  isPurchased: true,
  stateId: 1,
  ...overrides,
});

const form = (overrides = {}) => ({
  id: 10,
  name: "Maishiy texnika",
  code: "PG-EXISTING",
  parentId: 3,
  isAssignable: true,
  sortOrder: 7,
  stateId: 1,
  isService: false,
  products: [item()],
  ...overrides,
});

test("update payload guruhning texnik maydonlarini o'zgartirmasdan qaytaradi", () => {
  const payload = toUpdatePayload(form());

  assert.equal(payload.code, "PG-EXISTING");
  assert.equal(payload.parentId, 3);
  assert.equal(payload.isAssignable, true);
  assert.equal(payload.sortOrder, 7);
  assert.equal(payload.stateId, 1);
});

test("kod bo'sh bo'lsa avtomatik yaratiladi", () => {
  const created = toCreatePayload(form({ code: "" }));
  const updated = toUpdatePayload(form({ code: "   " }));

  assert.match(created.code, /^PG-[0-9A-Z]+-[0-9A-Z]{4}$/);
  assert.match(updated.code, /^PG-[0-9A-Z]+-[0-9A-Z]{4}$/);
  assert.notEqual(created.code, "");
});

test("yangi satr id'siz, mavjud satr o'z id'si bilan yuboriladi", () => {
  const payload = toUpdatePayload(
    form({ products: [item(), item({ id: undefined, new: true, idIndex: 2 })] }),
  );

  assert.equal(payload.products[0].id, 55);
  assert.equal(payload.products[1].id, null);
});

test("sotilmaydigan va xarid qilinmaydigan mahsulot rad etiladi", () => {
  assert.throws(
    () =>
      productItemSchema().validateSync(
        item({ isSold: false, isPurchased: false }),
      ),
    /soldOrPurchased/,
  );

  assert.doesNotThrow(() =>
    productItemSchema().validateSync(item({ isSold: false, isPurchased: true })),
  );
});

test("MXIK bo'sh yoki aynan 17 belgi bo'lishi kerak", () => {
  assert.doesNotThrow(() => productItemSchema().validateSync(item({ mxik: "" })));
  assert.doesNotThrow(() =>
    productItemSchema().validateSync(item({ mxik: "07321001010001058" })),
  );
  assert.throws(
    () => productItemSchema().validateSync(item({ mxik: "0732100" })),
    /mxikLength/,
  );
});

test("to'ldirilmagan kod/sku/artikul null bo'lib yuboriladi", () => {
  // inv_product'da (organization_id, code) bo'yicha `code IS NOT NULL` shartli
  // unikal indeks bor: bo'sh matn yuborilsa ikkinchi mahsulotdan boshlab
  // "duplicate key value violates unique constraint" xatosi chiqadi.
  const payload = toUpdatePayload(
    form({
      products: [
        item({ id: 1, code: undefined, sku: undefined, article: undefined }),
        item({ id: 2, code: "", sku: "  ", article: null }),
      ],
    }),
  );

  for (const line of payload.products) {
    assert.equal(line.code, null);
    assert.equal(line.sku, null);
    assert.equal(line.article, null);
  }
});

test("kiritilgan kod saqlanadi va bo'shliqlari kesiladi", () => {
  const payload = toCreatePayload(
    form({ products: [item({ code: "  TV-001  " })] }),
  );

  assert.equal(payload.products[0].code, "TV-001");
});

test("MXIK null bo'lgan mahsulot validatsiyadan o'tadi", () => {
  // Bazada mxik nullable: to'ldirilmagan mahsulot GET'da null bo'lib qaytadi.
  // Sxema uni rad etsa, butun guruhni saqlab bo'lmay qoladi.
  assert.doesNotThrow(() =>
    productItemSchema().validateSync(item({ mxik: null })),
  );
  assert.doesNotThrow(() =>
    productItemSchema().validateSync(item({ mxik: undefined })),
  );
});
