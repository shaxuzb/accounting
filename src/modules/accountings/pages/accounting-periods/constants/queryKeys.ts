import type { AccountingPeriodActionQuery } from "../types/type";

export const accountingPeriodsKeys = {
  all: ["accountings", "accounting-periods"] as const,
  close: (params?: AccountingPeriodActionQuery) =>
    [...accountingPeriodsKeys.all, "close", params] as const,
  reopen: (params?: AccountingPeriodActionQuery) =>
    [...accountingPeriodsKeys.all, "reopen", params] as const,
};
