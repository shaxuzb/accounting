import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { getJson } from "../../services/request";

export interface RegulatedFormHeader {
  organizationName: string;
  inn?: string | null;
  oked?: string | null;
  address?: string | null;
  director?: string | null;
  chiefAccountant?: string | null;
}

export interface RegulatedBalanceLine {
  code: string;
  name: string;
  level: number;
  isTotal: boolean;
  isSection: boolean;
  isManual: boolean;
  start: number | null;
  end: number | null;
}

export interface RegulatedBalance {
  header: RegulatedFormHeader;
  startDate: string;
  endDate: string;
  unit: number;
  lines: RegulatedBalanceLine[];
  /** 400 = 780 at both dates, checked by the server. */
  isBalanced: boolean;
  startOffset: number;
  endOffset: number;
  unmappedAccounts: string[];
}

export interface RegulatedResultLine {
  code: string;
  name: string;
  level: number;
  isTotal: boolean;
  incomeOpen: boolean;
  expenseOpen: boolean;
  priorIncome: number | null;
  priorExpense: number | null;
  income: number | null;
  expense: number | null;
}

export interface RegulatedResults {
  header: RegulatedFormHeader;
  dateFrom: string;
  dateTo: string;
  priorDateFrom: string;
  priorDateTo: string;
  unit: number;
  turnoverTax: boolean;
  lines: RegulatedResultLine[];
}

export interface RegulatedCashFlowLine {
  code: string;
  name: string;
  level: number;
  isTotal: boolean;
  isSection: boolean;
  inflow: number | null;
  outflow: number | null;
}

export interface RegulatedCurrencyLine {
  code: string;
  name: string;
  level: number;
  amount: number;
}

export interface RegulatedCashFlow {
  header: RegulatedFormHeader;
  dateFrom: string;
  dateTo: string;
  unit: number;
  lines: RegulatedCashFlowLine[];
  currencyLines: RegulatedCurrencyLine[];
  /** 240 = 230 + 220 ± 221 against the ledger, checked by the server. */
  isBalanced: boolean;
  /** The money moved with no cash flow item, placed by the correspondent account. */
  withoutItem: number;
}

export interface CashFlowItem {
  id: number;
  name: string;
  /** The line of form 4 (1C «Вид движения»): 010–200, "000" a transfer between own accounts, null by the account. */
  line: string | null;
}

export type ExpressCheckStatus = "OK" | "WARNING" | "ERROR";

export interface ExpressCheckItem {
  code: string;
  title: string;
  status: ExpressCheckStatus;
  message: string;
  details: { text: string; amount?: number | null; count?: number | null }[];
}

export interface ExpressCheck {
  dateFrom: string;
  dateTo: string;
  errors: number;
  warnings: number;
  items: ExpressCheckItem[];
}

const endpoints = {
  balance: "/reports/regulated/balance",
  results: "/reports/regulated/results",
  expressCheck: "/reports/regulated/express-check",
  cashFlow: "/reports/regulated/cash-flow",
  cashFlowItems: "/reports/regulated/cash-flow-items",
} as const;

export const useRegulatedBalance = (params: { dateTo: string; unit: number }) =>
  useQuery({
    queryKey: ["regulated-forms", "balance", params],
    queryFn: () => getJson<RegulatedBalance>(endpoints.balance, params),
    enabled: Boolean(params.dateTo),
    placeholderData: keepPreviousData,
  });

export const useRegulatedResults = (params: { year: number; monthTo: number; unit: number }) =>
  useQuery({
    queryKey: ["regulated-forms", "results", params],
    queryFn: () => getJson<RegulatedResults>(endpoints.results, params),
    placeholderData: keepPreviousData,
  });

export const useRegulatedCashFlow = (params: { year: number; monthTo: number; unit: number }) =>
  useQuery({
    queryKey: ["regulated-forms", "cash-flow", params],
    queryFn: () => getJson<RegulatedCashFlow>(endpoints.cashFlow, params),
    placeholderData: keepPreviousData,
  });

export const useCashFlowItems = (enabled: boolean) =>
  useQuery({
    queryKey: ["regulated-forms", "cash-flow-items"],
    queryFn: () => getJson<CashFlowItem[]>(endpoints.cashFlowItems),
    enabled,
  });

export const useSetCashFlowItemLine = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, line }: { id: number; line: string | null }) =>
      $axiosPrivate.put(`${endpoints.cashFlowItems}/${id}`, { line }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["regulated-forms", "cash-flow-items"] });
      void client.invalidateQueries({ queryKey: ["regulated-forms", "cash-flow"] });
    },
  });
};

export const useExpressCheck = (params: { dateTo: string }) =>
  useQuery({
    queryKey: ["regulated-forms", "express-check", params],
    queryFn: () => getJson<ExpressCheck>(endpoints.expressCheck, params),
    enabled: Boolean(params.dateTo),
    placeholderData: keepPreviousData,
  });
