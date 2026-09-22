import type { ProductItem, ProductTypeForm } from "./type";
// @ts-expect-error Native Node test runner loads TypeScript source modules directly.
import { buildProductGroupCode } from "../utils/groupCode.ts";

// Swagger DTO — guruh yaratish
export interface ProductGroupCreateDto {
  code: string;
  parentId: number | null;
  isAssignable: boolean;
  sortOrder: number;
  name: string;
  products: Array<{
    code: string | null;
    sku: string | null;
    article: string | null;
    name: string;
    barcode: string | null;
    mxik?: string | null;
    description: string;
    unitId: number;
    isPieceTracked: boolean;
    isService: boolean;
    isSold?: boolean;
    isPurchased?: boolean;
    productGroupId?: number | null;
    defaultVatRateId?: number | null;
    minStock?: number | null;
  }>;
}

// Swagger DTO — guruh yangilash
export interface ProductGroupUpdateDto {
  code: string;
  parentId: number | null;
  isAssignable: boolean;
  sortOrder: number;
  name: string;
  stateId: number;
  products: Array<{
    id?: number | null;
    stateId?: number | null;
    code: string | null;
    sku: string | null;
    article: string | null;
    name: string;
    barcode: string | null;
    mxik?: string | null;
    description: string;
    unitId: number;
    isPieceTracked: boolean;
    isService: boolean;
    isSold?: boolean;
    isPurchased?: boolean;
    productGroupId?: number | null;
    defaultVatRateId?: number | null;
    minStock?: number | null;
  }>;
}

// Guruhning texnik maydonlari ham yuborilishi shart: backend ularni to'g'ridan
// to'g'ri entity'ga yozadi, yuborilmasa mavjud qiymatlar tozalanib ketadi.
const toGroupFields = (form: ProductTypeForm) => ({
  code: form.code?.trim() || buildProductGroupCode(),
  parentId: form.parentId ?? null,
  isAssignable: form.isAssignable ?? true,
  sortOrder: form.sortOrder ?? 0,
  name: form.name,
});

// To'ldirilmagan matn maydonlari null bo'lib qolishi shart. inv_product'da
// (organization_id, code) bo'yicha `code IS NOT NULL` shartli unikal indeks bor,
// shuning uchun bo'sh matn yuborilsa ikkinchi mahsulotdanoq 23505 duplicate key
// xatosi chiqadi.
const optionalText = (value?: string | null) => value?.trim() || null;

const toLinePayload = (p: ProductItem, isService: boolean) => ({
  code: optionalText(p.code),
  sku: optionalText(p.sku),
  article: optionalText(p.article),
  name: p.name,
  barcode: p.barcode || null,
  mxik: p.mxik || null,
  description: p.description ?? "",
  unitId: p.unitId as number,
  isPieceTracked: Boolean(p.isPieceTracked),
  isService,
  isSold: Boolean(p.isSold),
  isPurchased: Boolean(p.isPurchased),
  productGroupId: p.productGroupId ?? null,
  defaultVatRateId: p.defaultVatRateId ?? null,
  minStock: p.minStock ?? null,
});

export const toCreatePayload = (
  form: ProductTypeForm,
): ProductGroupCreateDto => ({
  ...toGroupFields(form),
  products: form.products.map((p) => toLinePayload(p, form.isService)),
});

export const toUpdatePayload = (
  form: ProductTypeForm,
): ProductGroupUpdateDto => ({
  ...toGroupFields(form),
  stateId: form.stateId as number,
  products: form.products.map((p) => ({
    id: p.new ? null : (p.id ?? null),
    stateId: p.stateId ?? null,
    ...toLinePayload(p, form.isService),
  })),
});

// URL searchParams → server kutadigan ko'rinish (isService → IsService)
export const buildProductListParams = (
  raw?: URLSearchParams | Record<string, unknown>,
) => {
  const params: Record<string, unknown> = {};
  if (!raw) return params;
  if (raw instanceof URLSearchParams) {
    raw.forEach((value, key) => {
      params[key] = value;
    });
  } else {
    Object.assign(params, raw);
  }
  if ("isService" in params) {
    params.IsService = params.isService;
    delete params.isService;
  }
  return params;
};
