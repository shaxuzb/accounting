import { getJson } from "@/modules/accountings/services/request";
import { trialBalanceEndpoints } from "../constants/endpoints";
import type { TrialBalanceQuery, TrialBalanceResult } from "../types/type";

export const trialBalanceService = {
  list: (params: TrialBalanceQuery) =>
    getJson<TrialBalanceResult>(trialBalanceEndpoints.list, params),
};
