import { useMutation } from "@tanstack/react-query";
import { accountingPeriodsService } from "../services/accountingPeriodsService";
import type { AccountingPeriodActionQuery } from "../types/type";

export const useCloseAccountingPeriod = () =>
  useMutation({
    mutationFn: (params: AccountingPeriodActionQuery) =>
      accountingPeriodsService.close(params),
  });
