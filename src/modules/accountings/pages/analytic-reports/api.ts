import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getJson } from "../../services/request";

export interface AnalyticBalance {
  openingDebit: number;
  openingCredit: number;
  debit: number;
  credit: number;
  closingDebit: number;
  closingCredit: number;
}

export interface SubkontoBalanceRow {
  entityId: number | null;
  name: string;
  balance: AnalyticBalance;
}

export interface SubkontoBalance {
  accountNumber: string;
  accountName: string;
  subkontoTypeName: string;
  dateFrom: string;
  dateTo: string;
  rows: SubkontoBalanceRow[];
  total: AnalyticBalance;
}

export interface AccountAnalysisRow {
  /** The correspondent account (none for an off-balance entry). */
  accountId: number | null;
  accountNumber: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface AccountAnalysis {
  accountNumber: string;
  accountName: string;
  dateFrom: string;
  dateTo: string;
  rows: AccountAnalysisRow[];
  total: AnalyticBalance;
}

export interface SubkontoCardRow {
  entryId: number;
  date: string;
  documentTypeId: number;
  documentId: number;
  documentType: string | null;
  number: string | null;
  content: string | null;
  debitAccount: string | null;
  creditAccount: string | null;
  debit: number | null;
  credit: number | null;
  balance: number;
}

export interface SubkontoCard {
  subkontoTypeName: string;
  name: string;
  dateFrom: string;
  dateTo: string;
  openingBalance: number;
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  rows: SubkontoCardRow[];
  truncated: boolean;
}

export interface GeneralLedgerAccount {
  accountNumber: string;
  accountName: string;
  isOffBalance: boolean;
  months: { year: number; month: number; balance: AnalyticBalance }[];
  total: AnalyticBalance;
}

export interface GeneralLedger {
  dateFrom: string;
  dateTo: string;
  accounts: GeneralLedgerAccount[];
  total: AnalyticBalance;
}

export interface ChessSheet {
  dateFrom: string;
  dateTo: string;
  debitAccounts: { number: string; name: string }[];
  creditAccounts: { number: string; name: string }[];
  cells: { debit: string; credit: string; amount: number }[];
  total: number;
}

export interface ReconciliationActRow {
  date: string;
  documentTypeId: number;
  documentId: number;
  documentType: string | null;
  number: string | null;
  debit: number;
  credit: number;
}

export interface ReconciliationAct {
  organizationName: string;
  organizationInn: string | null;
  director: string | null;
  chiefAccountant: string | null;
  counterpartyName: string;
  counterpartyInn: string | null;
  contractName: string | null;
  dateFrom: string;
  dateTo: string;
  /** Positive when the counterparty owes the organization. */
  openingBalance: number;
  rows: ReconciliationActRow[];
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
}

export interface SubkontoTypeOption {
  id: number;
  name: string;
}

const base = "/reports/analytic";

const useReport = <T,>(name: string, params: object, enabled: boolean) =>
  useQuery({
    queryKey: ["analytic-reports", name, params],
    queryFn: () => getJson<T>(`${base}/${name}`, params),
    enabled,
    placeholderData: keepPreviousData,
  });

export const useSubkontoBalance = (params: { accountId: number | null; subkontoTypeId: number | null; dateFrom: string; dateTo: string }, enabled: boolean) =>
  useReport<SubkontoBalance>("subkonto-balance", params, enabled && Boolean(params.accountId && params.subkontoTypeId));

export const useAccountAnalysis = (params: { accountId: number | null; dateFrom: string; dateTo: string }, enabled: boolean) =>
  useReport<AccountAnalysis>("account-analysis", params, enabled && Boolean(params.accountId));

export const useSubkontoCard = (
  params: { subkontoTypeId: number | null; entityId: number | null; accountId: number | null; dateFrom: string; dateTo: string },
  enabled: boolean,
) => useReport<SubkontoCard>("subkonto-card", params, enabled && Boolean(params.subkontoTypeId && params.entityId));

export const useGeneralLedger = (params: { dateFrom: string; dateTo: string; detailed: boolean }, enabled: boolean) =>
  useReport<GeneralLedger>("general-ledger", params, enabled);

export const useChessSheet = (params: { dateFrom: string; dateTo: string; detailed: boolean }, enabled: boolean) =>
  useReport<ChessSheet>("chess-sheet", params, enabled);

export const useReconciliationAct = (
  params: { counterpartyId: number | null; contractId: number | null; dateFrom: string; dateTo: string },
  enabled: boolean,
) => useReport<ReconciliationAct>("reconciliation-act", params, enabled && Boolean(params.counterpartyId));

export const useAccountSubkontoTypes = (accountId: number | null) =>
  useQuery({
    queryKey: ["analytic-reports", "account-subkonto-types", accountId],
    queryFn: () => getJson<SubkontoTypeOption[]>(`${base}/account-subkonto-types`, { accountId }),
    enabled: Boolean(accountId),
  });
