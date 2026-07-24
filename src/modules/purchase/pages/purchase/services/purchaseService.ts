import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { purchaseEndpoints } from "../constants/endpoints";
import type {
  PurchaseData,
  PurchaseDetailData,
  PurchaseForm,
} from "../types/type";
import type {
  PurchaseCreatePayload,
  PurchaseUpdatePayload,
} from "../types/form";

type QueryParams = ListParams | URLSearchParams;
type UnknownRecord = Record<string, unknown>;

const endpoints = purchaseEndpoints.purchase;

const normalizeParams = (params?: QueryParams) =>
  params instanceof URLSearchParams
    ? Object.fromEntries(params)
    : (params ?? {});

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};

const toNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizePurchaseList = (
  value: unknown,
): Paginated<PurchaseData> => {
  const response = toRecord(value);
  const nested = toRecord(response.data ?? response.result);
  const root = Object.keys(nested).length ? nested : response;
  const rawItems = root.items ?? root.results ?? root.rows;
  const items = Array.isArray(rawItems) ? (rawItems as PurchaseData[]) : [];

  return {
    items,
    total: toNumber(root.total ?? root.count ?? root.totalCount, items.length),
    page: toNumber(root.page ?? root.pageNumber, 1),
    pageSize: toNumber(root.pageSize, items.length),
  };
};

export const purchaseService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<unknown>(endpoints.list, {
        params: {
          ...normalizeParams(params),
        },
      })
      .then((res) => normalizePurchaseList(res.data)),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<PurchaseDetailData>(endpoints.detail(id))
      .then((res) => res.data),
  create: (payload: PurchaseCreatePayload) =>
    $axiosPrivate
      .post<PurchaseDetailData>(endpoints.create, payload)
      .then((res) => res.data),
  update: (
    id: string | number,
    payload: PurchaseUpdatePayload | Partial<PurchaseForm>,
  ) =>
    $axiosPrivate
      .put<PurchaseDetailData>(endpoints.update(id), payload)
      .then((res) => res.data),
  confirm: (id: string | number) =>
    $axiosPrivate
      .put<PurchaseDetailData>(endpoints.confirm(id))
      .then((res) => res.data),
  cancel: (id: string | number) =>
    $axiosPrivate
      .put<PurchaseDetailData>(endpoints.cancel(id))
      .then((res) => res.data),
};
