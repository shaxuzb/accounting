import { getJson } from "../../services/request";
import { accountingReportEndpoints } from "./constants/endpoints";
import type {
  AccountCardQuery,
  AccountCardResponse,
  AccountTurnoverQuery,
  BalanceSheetQuery,
  BalanceSheetResponse,
  CashFlowQuery,
  CashFlowResponse,
  IncomeStatementQuery,
  IncomeStatementResponse,
  JournalQuery,
  JournalResponse,
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
      {
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
      },
    ),
  journal: (params?: JournalQuery) =>
    getJson<JournalResponse>(accountingReportEndpoints.journal, params),
  accountCard: (params?: AccountCardQuery) =>
    getJson<AccountCardResponse>(accountingReportEndpoints.accountCard, params),
};
