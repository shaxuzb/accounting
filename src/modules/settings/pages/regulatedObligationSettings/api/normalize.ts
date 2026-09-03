import type { RegulatedObligationSetting } from "../types";

export interface RegulatedObligationSettingsPage {
  items: RegulatedObligationSetting[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

type PaginatedResponse = {
  items?: RegulatedObligationSetting[];
  results?: RegulatedObligationSetting[];
  data?:
    | RegulatedObligationSetting[]
    | {
        items?: RegulatedObligationSetting[];
        results?: RegulatedObligationSetting[];
        data?: RegulatedObligationSetting[];
        total?: number;
        totalCount?: number;
        page?: number;
        pageSize?: number;
        totalPages?: number;
      };
  total?: number;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
};

export type RegulatedObligationSettingsResponse =
  | RegulatedObligationSetting[]
  | PaginatedResponse;

export function normalizeRegulatedObligationSettingsResponse(
  response: RegulatedObligationSettingsResponse,
  requested = { page: 1, pageSize: 20 },
): RegulatedObligationSettingsPage {
  if (Array.isArray(response)) {
    const start = (requested.page - 1) * requested.pageSize;
    const items = response.slice(start, start + requested.pageSize);
    return {
      items,
      total: response.length,
      page: requested.page,
      pageSize: requested.pageSize,
      totalPages: response.length
        ? Math.ceil(response.length / requested.pageSize)
        : 0,
    };
  }

  const nested =
    !Array.isArray(response.data) && response.data ? response.data : undefined;
  const items = Array.isArray(response.data)
    ? response.data
    : (response.items ?? response.results ?? nested?.items ?? nested?.results ?? nested?.data ?? []);
  const page = response.page ?? nested?.page ?? requested.page;
  const pageSize = response.pageSize ?? nested?.pageSize ?? requested.pageSize;
  const total = response.total ?? response.totalCount ?? nested?.total ?? nested?.totalCount ?? items.length;

  return {
    items,
    total,
    page,
    pageSize,
    totalPages:
      response.totalPages ?? nested?.totalPages ?? (total ? Math.ceil(total / pageSize) : 0),
  };
}
