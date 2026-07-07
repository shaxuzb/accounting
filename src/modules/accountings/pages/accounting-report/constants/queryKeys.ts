export const accountingReportKeys = {
  all: ["accounting-report"] as const,
  balanceSheet: (params?: unknown) =>
    [...accountingReportKeys.all, "balance-sheet", params] as const,
  incomeStatement: (params?: unknown) =>
    [...accountingReportKeys.all, "income-statement", params] as const,
  cashFlow: (params?: unknown) =>
    [...accountingReportKeys.all, "cash-flow", params] as const,
  accountTurnover: (params?: unknown) =>
    [...accountingReportKeys.all, "account-turnover", params] as const,
  accountCard: (params?: unknown) =>
    [...accountingReportKeys.all, "account-card", params] as const,
  journal: (params?: unknown) =>
    [...accountingReportKeys.all, "journal", params] as const,
} as const;
