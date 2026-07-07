import { useQuery } from "@tanstack/react-query";
import { ledgerKeys } from "../constants/queryKeys";
import { ledgerService } from "../services/ledgerService";
import type { LedgerQuery } from "../types/type";

export const useGetLedger = (params?: LedgerQuery) =>
  useQuery({
    queryKey: ledgerKeys.list(params),
    queryFn: () => ledgerService.list(params!),
    enabled: Boolean(params),
  });
