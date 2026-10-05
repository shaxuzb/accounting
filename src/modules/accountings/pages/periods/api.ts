import { getJson, postJson } from "@/modules/accountings/services/request";
import type { AccountingPeriod, MonthCloseCheck } from "./types";

export const periodPermissions = {
  close: "ACCOUNTING_PERIOD_CLOSE",
  reopen: "ACCOUNTING_PERIOD_REOPEN",
} as const;

export const periodService = {
  list: (year: number) => getJson<AccountingPeriod[]>("/accounting-periods", { year }),
  closeCheck: (id: number) =>
    getJson<MonthCloseCheck>(`/accounting-periods/${id}/close-check`),
  close: (id: number) => postJson(`/accounting-periods/${id}/close`),
  reopen: (id: number) => postJson(`/accounting-periods/${id}/reopen`),
};
