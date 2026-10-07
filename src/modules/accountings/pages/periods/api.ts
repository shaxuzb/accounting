import { getJson, postJson } from "@/modules/accountings/services/request";
import type {
  AccountingPeriod,
  AccountingPeriodMonth,
  MonthCloseCheck,
  MonthCloseThroughResult,
} from "./types";

export const periodPermissions = {
  close: "ACCOUNTING_PERIOD_CLOSE",
  reopen: "ACCOUNTING_PERIOD_REOPEN",
} as const;

export const periodService = {
  list: (year: number) => getJson<AccountingPeriod[]>("/accounting-periods", { year }),
  closeCheck: (id: number) =>
    getJson<MonthCloseCheck>(`/accounting-periods/${id}/close-check`),
  close: (id: number) => postJson<MonthCloseThroughResult>(`/accounting-periods/${id}/close`),
  reopen: (id: number) => postJson<AccountingPeriodMonth[]>(`/accounting-periods/${id}/reopen`),
  reopenPreview: (id: number) =>
    getJson<AccountingPeriodMonth[]>(`/accounting-periods/${id}/reopen-preview`),
  recloseRequired: () => getJson<AccountingPeriodMonth[]>("/accounting-periods/reclose-required"),
};
