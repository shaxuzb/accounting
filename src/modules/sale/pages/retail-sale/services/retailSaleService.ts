import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { retailSaleEndpoints } from "../constants/endpoints";
import type {
  RetailSaleConfirmPayload,
  RetailSaleCreatePayload,
  RetailSaleUpdatePayload,
} from "../types/form";
import type { RetailSaleDoc } from "../types/type";

type QueryParams = ListParams | URLSearchParams;
type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};

const toNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeList = (value: unknown): Paginated<RetailSaleDoc> => {
  const response = toRecord(value);
  const nested = toRecord(response.data ?? response.result);
  const root = Object.keys(nested).length ? nested : response;
  const rawItems = root.items ?? root.results ?? root.rows;
  const items = Array.isArray(rawItems) ? (rawItems as RetailSaleDoc[]) : [];

  return {
    items,
    total: toNumber(root.total ?? root.count ?? root.totalCount, items.length),
    page: toNumber(root.page ?? root.pageNumber, 1),
    pageSize: toNumber(root.pageSize, items.length || 20),
  };
};

const normalizeParams = (params?: QueryParams) =>
  params instanceof URLSearchParams ? Object.fromEntries(params) : params;

export const retailSaleService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<unknown>(retailSaleEndpoints.list, {
        params: normalizeParams(params),
      })
      .then((response) => normalizeList(response.data)),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<RetailSaleDoc>(retailSaleEndpoints.detail(id))
      .then((response) => response.data),
  create: (payload: RetailSaleCreatePayload) =>
    $axiosPrivate
      .post<RetailSaleDoc>(retailSaleEndpoints.create, payload)
      .then((response) => response.data),
  update: (id: string | number, payload: RetailSaleUpdatePayload) =>
    $axiosPrivate
      .put<RetailSaleDoc>(retailSaleEndpoints.update(id), payload)
      .then((response) => response.data),
  delete: (id: string | number) =>
    $axiosPrivate
      .delete(retailSaleEndpoints.delete(id))
      .then((response) => response.data),
  confirm: (id: string | number, payload: RetailSaleConfirmPayload) =>
    $axiosPrivate
      .put<RetailSaleDoc>(retailSaleEndpoints.confirm(id), payload)
      .then((response) => response.data),
  cancel: (id: string | number) =>
    $axiosPrivate
      .put<RetailSaleDoc>(retailSaleEndpoints.cancel(id))
      .then((response) => response.data),
};
