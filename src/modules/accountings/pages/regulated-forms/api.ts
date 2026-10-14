import { useQuery, keepPreviousData } from "@tanstack/react-query";
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

export const useExpressCheck = (params: { dateTo: string }) =>
  useQuery({
    queryKey: ["regulated-forms", "express-check", params],
    queryFn: () => getJson<ExpressCheck>(endpoints.expressCheck, params),
    enabled: Boolean(params.dateTo),
    placeholderData: keepPreviousData,
  });
