import type { TrialBalanceQuery } from "../types/type";

export const trialBalanceKeys = {
  all: ["accountings", "trial-balance"] as const,
  list: (params?: TrialBalanceQuery) => [...trialBalanceKeys.all, params] as const,
};
