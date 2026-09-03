export interface RegulatedObligationSettingsQuery {
  categoryCode?: string | null;
  choosedDate?: string | null;
  search?: string | null;
  isConfigured?: boolean;
  page?: number | null;
  pageSize?: number | null;
}

export function buildRegulatedObligationSettingsQuery(
  filters: RegulatedObligationSettingsQuery,
) {
  const params = new URLSearchParams();

  if (filters.categoryCode) params.set("categoryCode", filters.categoryCode);
  if (filters.choosedDate) params.set("choosedDate", filters.choosedDate);
  if (filters.search) params.set("search", filters.search);
  if (filters.isConfigured !== undefined) {
    params.set("isConfigured", String(filters.isConfigured));
  }
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

  return params;
}
