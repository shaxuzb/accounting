import { useQuery } from "@tanstack/react-query";
import { accountingReportService } from "../api";
import { accountingReportKeys } from "../constants/queryKeys";
import type { IncomeStatementQuery } from "../types/type";

export const useGetIncomeStatement = (params?: IncomeStatementQuery) =>
  useQuery({
    queryKey: accountingReportKeys.incomeStatement(params ?? null),
    queryFn: () => accountingReportService.incomeStatement(params),
    enabled: Boolean(params),
  });
