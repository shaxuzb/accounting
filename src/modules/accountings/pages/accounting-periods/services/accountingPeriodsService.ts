import { postJson } from "@/modules/accountings/services/request";
import { accountingPeriodsEndpoints } from "../constants/endpoints";
import type {
  AccountingPeriodActionQuery,
  AccountingPeriodActionResult,
} from "../types/type";

export const accountingPeriodsService = {
  close: ({ periodId }: AccountingPeriodActionQuery) =>
    postJson<AccountingPeriodActionResult>(
      accountingPeriodsEndpoints.close(periodId),
    ),
  reopen: ({ periodId }: AccountingPeriodActionQuery) =>
    postJson<AccountingPeriodActionResult>(
      accountingPeriodsEndpoints.reopen(periodId),
    ),
};
