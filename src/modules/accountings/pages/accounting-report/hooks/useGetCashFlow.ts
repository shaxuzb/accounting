import { useQuery } from "@tanstack/react-query";
import { accountingReportService } from "../api";
import { accountingReportKeys } from "../constants/queryKeys";
import type { CashFlowQuery } from "../types/type";

export const useGetCashFlow = (params?: CashFlowQuery) =>
  useQuery({
    queryKey: accountingReportKeys.cashFlow(params ?? null),
    queryFn: () => accountingReportService.cashFlow(params),
    enabled: Boolean(params),
  });
