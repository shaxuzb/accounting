import type { LedgerQuery } from "../types/type";

export const ledgerKeys = {
  all: ["accountings", "ledger"] as const,
  list: (params?: LedgerQuery) => [...ledgerKeys.all, params] as const,
};
