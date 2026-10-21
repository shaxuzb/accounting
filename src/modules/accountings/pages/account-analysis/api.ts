import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getJson } from "../../services/request";
import type { AnalyticBalance } from "../analytic-reports/api";

/** The side of the account a turnover cell of the trial balance opens. */
export type DrillSide = "debit" | "credit";

export interface DrillEntry {
  id: number;
  postingDate: string;
  journalNumber: string | null;
  documentNumber: string | null;
  documentTypeId: number;
  documentId: number;
  documentType: string;
  description: string | null;
  debit: number;
  credit: number;
  runningBalance: number;
  currencyId: number;
  currency: string;
  currencyAmount: number | null;
  quantity: number | null;
  corrAccountId: number | null;
  corrAccountNumber: string | null;
  corrAccountName: string | null;
  analytics: string | null;
  corrAnalytics: string | null;
}

export interface DrillLedger {
  accountId: number;
  accountCode: string;
  accountName: string;
  openingBalance: number;
  closingBalance: number;
  totalDebit: number;
  totalCredit: number;
  /** A side, correspondent or search filter: the rows are a part of the movement, no running balance. */
  partial: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  transactions: DrillEntry[];
}

export interface DrillLedgerParams {
  accountId: number;
  dateFrom: string;
  dateTo: string;
  side?: DrillSide | null;
  corrAccountId?: number | null;
  subkontoTypeId?: number | null;
  entityId?: number | null;
  search?: string;
  page: number;
  pageSize: number;
}

export interface AccountPeriods {
  accountNumber: string;
  accountName: string;
  dateFrom: string;
  dateTo: string;
  months: { year: number; month: number; balance: AnalyticBalance }[];
  total: AnalyticBalance;
}

export const useDrillLedger = (params: DrillLedgerParams, enabled = true) =>
  useQuery({
    queryKey: ["account-drill", "ledger", params],
    queryFn: () => getJson<DrillLedger>("/register/ledger", params),
    enabled: enabled && params.accountId > 0,
    placeholderData: keepPreviousData,
  });

export const useAccountPeriods = (params: { accountId: number; dateFrom: string; dateTo: string }, enabled = true) =>
  useQuery({
    queryKey: ["account-drill", "periods", params],
    queryFn: () => getJson<AccountPeriods>("/reports/analytic/account-periods", params),
    enabled: enabled && params.accountId > 0,
    placeholderData: keepPreviousData,
  });

/** The whole period of a trial balance opened without dates (all time), for the reports that need one. */
export const ALL_TIME_FROM = "2000-01-01";
export const ALL_TIME_TO = "2099-12-31";
