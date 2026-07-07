import { getJson } from "@/modules/accountings/services/request";
import { ledgerEndpoints } from "../constants/endpoints";
import type { LedgerQuery, LedgerResult } from "../types/type";

export const ledgerService = {
  list: (params: LedgerQuery) =>
    getJson<LedgerResult>(ledgerEndpoints.list, params),
};
