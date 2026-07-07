import { useMutation } from "@tanstack/react-query";
import { accountingPeriodsService } from "../services/accountingPeriodsService";
import type { AccountingPeriodActionQuery } from "../types/type";

export const useReopenAccountingPeriod = () =>
  useMutation({
    mutationFn: (params: AccountingPeriodActionQuery) =>
      accountingPeriodsService.reopen(params),
  });
