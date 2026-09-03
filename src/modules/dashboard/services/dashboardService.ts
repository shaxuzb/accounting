import { $axiosPrivate } from "@/services/AxiosService";
import { dashboardEndpoints } from "../constants/endpoints";
import {
  buildCashQuery,
  buildElectronicDocumentsQuery,
  buildOverviewQuery,
  buildReceivablesPayablesQuery,
  buildTaxSummaryQuery,
} from "../api/query";
import type {
  DashboardFilters,
  DashboardOverview,
  ElectronicDocumentsFilters,
  ElectronicDocumentsSummary,
  ReceivablesPayablesSummary,
  TaxSummary,
  TaxSummaryFilters,
  CashSummary,
} from "../types/type";

const emptyDashboardOverview = (
  filters: DashboardFilters,
): DashboardOverview => ({
  filters,
  cash: {
    sourceStatus: "NOT_AVAILABLE",
    items: [],
    totals: { openingBalance: 0, inflow: 0, outflow: 0, closingBalance: 0 },
  },
  relationships: {
    sourceStatus: "NOT_AVAILABLE",
    incoming: { sourceStatus: "NOT_AVAILABLE", total: 0, statusCounts: [] },
    outgoing: { sourceStatus: "NOT_AVAILABLE", total: 0, statusCounts: [] },
  },
  tasks: {
    sourceStatus: "NOT_AVAILABLE",
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    items: [],
  },
  receivables: {
    sourceStatus: "NOT_AVAILABLE",
    current: 0,
    overdue: null,
    buckets: [],
    counterparties: [],
  },
  payables: {
    sourceStatus: "NOT_AVAILABLE",
    current: 0,
    overdue: null,
    buckets: [],
    counterparties: [],
  },
  tax: { sourceStatus: "NOT_AVAILABLE", total: 0, isVatPayer: null, items: [] },
  electronicDocuments: {
    sourceStatus: "NOT_AVAILABLE",
    statusCounts: [],
    typeCounts: [],
    directionCounts: [],
    currencyTotals: [],
    amountSeries: [],
  },
});

const isFulfilled = <T>(
  result: PromiseSettledResult<T>,
): result is PromiseFulfilledResult<T> => result.status === "fulfilled";

const get = async <T>(path: string, params: URLSearchParams) => {
  const { data } = await $axiosPrivate.get<T>(path, { params });
  return data;
};

export const dashboardService = {
  getOverview: (filters: DashboardFilters) =>
    get<DashboardOverview>(
      dashboardEndpoints.overview,
      buildOverviewQuery(filters),
    ),
  getCash: (filters: DashboardFilters) =>
    get<CashSummary>(dashboardEndpoints.cash, buildCashQuery(filters)),
  getReceivablesPayables: (filters: DashboardFilters) =>
    get<ReceivablesPayablesSummary>(
      dashboardEndpoints.receivablesPayables,
      buildReceivablesPayablesQuery(filters),
    ),
  getElectronicDocuments: (filters: ElectronicDocumentsFilters) =>
    get<ElectronicDocumentsSummary>(
      dashboardEndpoints.electronicDocuments,
      buildElectronicDocumentsQuery(filters),
    ),
  getTaxSummary: (filters: TaxSummaryFilters) =>
    get<TaxSummary>(
      dashboardEndpoints.taxSummary,
      buildTaxSummaryQuery(filters),
    ),
  getDashboardBundle: async (filters: DashboardFilters) => {
    const results = await Promise.allSettled([
      dashboardService.getOverview(filters),
      dashboardService.getCash(filters),
      dashboardService.getReceivablesPayables(filters),
      dashboardService.getElectronicDocuments({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      }),
      dashboardService.getTaxSummary({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        currencyIds: filters.currencyIds,
      }),
    ]);

    const [overviewResult, cashResult, debtResult, documentsResult, taxResult] =
      results;
    const overview = isFulfilled(overviewResult)
      ? overviewResult.value
      : undefined;
    const cash = isFulfilled(cashResult) ? cashResult.value : undefined;
    const debts = isFulfilled(debtResult) ? debtResult.value : undefined;
    const documents = isFulfilled(documentsResult)
      ? documentsResult.value
      : undefined;
    const tax = isFulfilled(taxResult) ? taxResult.value : undefined;

    if (!overview && !cash && !debts && !documents && !tax) {
      if (overviewResult.status === "rejected") throw overviewResult.reason;
      throw new Error("Dashboard data is unavailable");
    }

    const base = overview ?? emptyDashboardOverview(filters);

    return {
      ...base,
      cash: cash ?? base.cash,
      receivables: debts?.receivables ?? base.receivables,
      payables: debts?.payables ?? base.payables,
      electronicDocuments: documents ?? base.electronicDocuments,
      tax: tax ?? base.tax,
    };
  },
};
