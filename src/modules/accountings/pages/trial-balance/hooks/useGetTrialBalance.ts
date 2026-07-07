import { useQuery } from "@tanstack/react-query";
import { trialBalanceKeys } from "../constants/queryKeys";
import { trialBalanceService } from "../services/trialBalanceService";
import type { TrialBalanceQuery } from "../types/type";

export const useGetTrialBalance = (params?: TrialBalanceQuery) =>
  useQuery({
    queryKey: trialBalanceKeys.list(params),
    queryFn: () => trialBalanceService.list(params!),
    enabled: Boolean(params),
  });
