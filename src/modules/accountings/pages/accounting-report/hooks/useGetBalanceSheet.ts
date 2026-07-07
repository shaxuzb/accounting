import { useQuery } from "@tanstack/react-query";
import { accountingReportService } from "../api";
import { accountingReportKeys } from "../constants/queryKeys";
import type { BalanceSheetQuery } from "../types/type";

export const useGetBalanceSheet = (params?: BalanceSheetQuery) =>
  useQuery({
    queryKey: accountingReportKeys.balanceSheet(params ?? null),
    queryFn: () => accountingReportService.balanceSheet(params),
    enabled: Boolean(params),
  });
