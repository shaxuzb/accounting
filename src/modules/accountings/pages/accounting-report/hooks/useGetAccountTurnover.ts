import { useQuery } from "@tanstack/react-query";
import { accountingReportService } from "../api";
import { accountingReportKeys } from "../constants/queryKeys";
import type { AccountTurnoverQuery } from "../types/type";

export const useGetAccountTurnover = (params?: AccountTurnoverQuery) =>
  useQuery({
    queryKey: accountingReportKeys.accountTurnover(params ?? null),
    queryFn: () => accountingReportService.accountTurnover(params),
    enabled: Boolean(params),
  });
