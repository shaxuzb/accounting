import type { ProductTypeForm } from "./type";

// Swagger DTO — guruh yaratish
export interface ProductGroupCreateDto {
  name: string;
  products: Array<{
    name: string;
    barcode: string | null;
    mxik?: string | null;
    description: string;
    unitId: number;
    isPieceTracked: boolean;
    isService: boolean;
  }>;
}

// Swagger DTO — guruh yangilash
export interface ProductGroupUpdateDto {
  name: string;
  stateId: number;
  products: Array<{
    id?: number | null;
    stateId?: number | null;
    name: string;
    barcode: string | null;
    mxik?: string | null;
    description: string;
    unitId: number;
    isPieceTracked: boolean;
    isService: boolean;
  }>;
}

export const toCreatePayload = (
  form: ProductTypeForm,
): ProductGroupCreateDto => ({
  name: form.name,
  products: form.products.map((p) => ({
    name: p.name,
    barcode: p.barcode || null,
    mxik: p.mxik || null,
    description: p.description ?? "",
    unitId: p.unitId as number,
    isPieceTracked: Boolean(p.isPieceTracked),
    isService: form.isService,
  })),
});

export const toUpdatePayload = (
  form: ProductTypeForm,
): ProductGroupUpdateDto => ({
  name: form.name,
  stateId: form.stateId as number,
  products: form.products.map((p) => ({
    id: p.new ? null : (p.id ?? null),
    stateId: p.stateId ?? null,
    name: p.name,
    barcode: p.barcode || null,
    mxik: p.mxik || null,
    description: p.description ?? "",
    unitId: p.unitId as number,
    isPieceTracked: Boolean(p.isPieceTracked),
    isService: form.isService,
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
