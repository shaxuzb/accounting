import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { openingInventoryEndpoints } from "../constants/endpoints";
import type {
  OpeningInventoryListItem,
  OpeningInventoryDetailData,
} from "../types/type";
import type { OpeningInventoryPayload } from "../types/form";

type QueryParams = ListParams | URLSearchParams;
type UnknownRecord = Record<string, unknown>;

const endpoints = openingInventoryEndpoints.openingInventory;

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

const normalizeList = (
  value: unknown,
): Paginated<OpeningInventoryListItem> => {
  const response = toRecord(value);
  const nested = toRecord(response.data ?? response.result);
  const root = Object.keys(nested).length ? nested : response;
  const rawItems = root.items ?? root.results ?? root.rows;
  const items = Array.isArray(rawItems)
    ? (rawItems as OpeningInventoryListItem[])
    : [];

  return {
    items,
    total: toNumber(root.total ?? root.count ?? root.totalCount, items.length),
    page: toNumber(root.page ?? root.pageNumber, 1),
    pageSize: toNumber(root.pageSize, items.length),
  };
};

export const openingInventoryService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<unknown>(endpoints.list, {
        params: {
          ...normalizeParams(params),
        },
      })
      .then((res) => normalizeList(res.data)),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<OpeningInventoryDetailData>(endpoints.detail(id))
      .then((res) => res.data),
  create: (payload: OpeningInventoryPayload) =>
    $axiosPrivate
      .post<OpeningInventoryDetailData>(endpoints.create, payload)
      .then((res) => res.data),
  update: (id: string | number, payload: OpeningInventoryPayload) =>
    $axiosPrivate
      .put<OpeningInventoryDetailData>(endpoints.update(id), payload)
      .then((res) => res.data),
  delete: (id: string | number) =>
    $axiosPrivate
      .delete(endpoints.delete(id))
      .then((res) => res.data),
};
