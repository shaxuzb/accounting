import type {
  DashboardFilters,
  ElectronicDocumentsFilters,
  TaxSummaryFilters,
} from "../types/type";

type QueryValue = string | number | null | undefined;

function appendValue(params: URLSearchParams, name: string, value: QueryValue) {
  if (value !== null && value !== undefined && value !== "") {
    params.append(name, String(value));
  }
}

function appendArray<T>(params: URLSearchParams, name: string, values?: T[]) {
  for (const value of values ?? []) params.append(name, String(value));
}

export function buildOverviewQuery(filter: DashboardFilters) {
  const params = new URLSearchParams();
  appendValue(params, "dateFrom", filter.dateFrom);
  appendValue(params, "dateTo", filter.dateTo);
  appendArray(params, "currencyIds", filter.currencyIds);
  return params;
}

export const buildCashQuery = buildOverviewQuery;
export const buildReceivablesPayablesQuery = buildOverviewQuery;

export function buildElectronicDocumentsQuery(
  filter: ElectronicDocumentsFilters,
) {
  const params = new URLSearchParams();
  appendValue(params, "dateFrom", filter.dateFrom);
  appendValue(params, "dateTo", filter.dateTo);
  appendArray(params, "documentTypes", filter.documentTypes);
  appendArray(params, "statusIds", filter.statusIds);
  return params;
}

export function buildTaxSummaryQuery(filter: TaxSummaryFilters) {
  const params = new URLSearchParams();
  appendValue(params, "dateFrom", filter.dateFrom);
  appendValue(params, "dateTo", filter.dateTo);
  appendArray(params, "currencyIds", filter.currencyIds);
  appendArray(params, "documentTypes", filter.documentTypes);
  return params;
}

export function buildTaskCalendarQuery(filter: {
  dateFrom?: string | null;
  dateTo?: string | null;
}) {
  const params = new URLSearchParams();
  appendValue(params, "dateFrom", filter.dateFrom);
  appendValue(params, "dateTo", filter.dateTo);
  return params;
}
