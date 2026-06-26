import { $axiosPrivate } from "@/services/AxiosService";
import { productEndpoints } from "./constants/endpoints";
import type {
  ProductListResponse,
  ProductType,
  ProductTypeForm,
} from "./types/type";

// Swagger DTO shape — group create
interface ProductGroupCreateDto {
  name: string;
  products: Array<{
    name: string;
    barcode: string;
    description: string;
    unitId: number;
    isService: boolean;
  }>;
}

// Swagger DTO shape — group update
interface ProductGroupUpdateDto {
  name: string;
  stateId: number;
  products: Array<{
    id?: number | null;
    stateId?: number | null;
    name: string;
    barcode: string;
    description: string;
    unitId: number;
    isService: boolean;
  }>;
}

const toCreatePayload = (form: ProductTypeForm): ProductGroupCreateDto => ({
  name: form.name,
  products: form.products.map((p) => ({
    name: p.name,
    barcode: p.barcode,
    description: p.description ?? "",
    unitId: p.unitId as number,
    isService: form.isService,
  })),
});

const toUpdatePayload = (form: ProductTypeForm): ProductGroupUpdateDto => ({
  name: form.name,
  stateId: form.stateId as number,
  products: form.products.map((p) => ({
    id: p.new ? null : (p.id ?? null),
    stateId: p.stateId ?? null,
    name: p.name,
    barcode: p.barcode,
    description: p.description ?? "",
    unitId: p.unitId as number,
    isService: form.isService,
  })),
});

const buildListParams = (raw?: URLSearchParams | Record<string, unknown>) => {
  const params: Record<string, unknown> = {};
  if (!raw) return params;
  if (raw instanceof URLSearchParams) {
    raw.forEach((value, key) => {
      params[key] = value;
    });
  } else {
    Object.assign(params, raw);
  }
  // Normalise isService → IsService (server expects PascalCase)
  if ("isService" in params) {
    params.IsService = params.isService;
    delete params.isService;
  }
  return params;
};

export const productService = {
  list: (params?: URLSearchParams | Record<string, unknown>) =>
    $axiosPrivate
      .get<ProductListResponse>(productEndpoints.list, {
        params: buildListParams(params),
      })
      .then((res) => res.data),

  detail: (id: string | number, isService?: boolean) =>
    $axiosPrivate
      .get<ProductType>(productEndpoints.detail(id), {
        params: isService !== undefined ? { isService } : undefined,
      })
      .then((res) => res.data),

  create: (payload: ProductTypeForm) =>
    $axiosPrivate
      .post<ProductType>(productEndpoints.create, toCreatePayload(payload))
      .then((res) => res.data),

  update: (id: string | number, payload: ProductTypeForm) =>
    $axiosPrivate
      .put<ProductType>(productEndpoints.update(id), toUpdatePayload(payload))
      .then((res) => res.data),
};
