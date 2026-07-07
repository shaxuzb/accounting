import { useQuery } from "@tanstack/react-query";
import { accountingReportService } from "../api";
import { accountingReportKeys } from "../constants/queryKeys";
import type { AccountCardQuery } from "../types/type";

export const useGetAccountCard = (params?: AccountCardQuery) =>
  useQuery({
    queryKey: accountingReportKeys.accountCard(params ?? null),
    queryFn: () => accountingReportService.accountCard(params),
    enabled: Boolean(params),
  });
