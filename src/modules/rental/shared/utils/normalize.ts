import type { Paginated } from "@/shared/types";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};

export const normalizePaginated = <T>(value: unknown): Paginated<T> => {
  const response = asRecord(value);
  const nested = asRecord(response.data ?? response.result);
  const root = Object.keys(nested).length ? nested : response;
  const items = Array.isArray(root.items)
    ? (root.items as T[])
    : Array.isArray(response.data)
      ? (response.data as T[])
      : Array.isArray(response.result)
        ? (response.result as T[])
        : [];

  return {
    items,
    total: Number(root.total ?? root.totalCount ?? root.count ?? items.length),
    page: Number(root.page ?? root.pageNumber ?? 1),
    pageSize: Number(root.pageSize ?? items.length),
    totalPages: Number(root.totalPages ?? 0) || undefined,
    hasPreviousPage: Boolean(root.hasPreviousPage),
    hasNextPage: Boolean(root.hasNextPage),
  };
};
