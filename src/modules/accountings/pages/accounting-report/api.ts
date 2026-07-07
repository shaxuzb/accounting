import { getJson } from "../../services/request";
import { accountingReportEndpoints } from "./constants/endpoints";
import type {
  AccountCardQuery,
  AccountTurnoverQuery,
  BalanceSheetQuery,
  BalanceSheetResponse,
  CashFlowQuery,
  CashFlowResponse,
  IncomeStatementQuery,
  IncomeStatementResponse,
  JournalQuery,
  RawAccountingReportResponse,
  AccountTurnoverResponse,
} from "./types/type";

export const accountingReportService = {
  balanceSheet: (params?: BalanceSheetQuery) =>
    getJson<BalanceSheetResponse>(accountingReportEndpoints.balanceSheet, params),
  incomeStatement: (params?: IncomeStatementQuery) =>
    getJson<IncomeStatementResponse>(
      accountingReportEndpoints.incomeStatement,
      params,
    ),
  cashFlow: (params?: CashFlowQuery) =>
    getJson<CashFlowResponse>(accountingReportEndpoints.cashFlow, params),
  accountTurnover: (params?: AccountTurnoverQuery) =>
    getJson<AccountTurnoverResponse>(
      accountingReportEndpoints.accountTurnover,
      params,
    ),
  journal: (params?: JournalQuery) =>
    getJson<RawAccountingReportResponse>(accountingReportEndpoints.journal, params),
  accountCard: (params?: AccountCardQuery) =>
    getJson<RawAccountingReportResponse>(accountingReportEndpoints.accountCard, params),
};
