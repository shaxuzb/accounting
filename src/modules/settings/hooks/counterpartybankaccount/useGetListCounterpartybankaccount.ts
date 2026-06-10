import { useQuery } from "@tanstack/react-query";
// import type { ListParams } from "@/shared/types";
import { settingsKeys } from "../../constants/queryKeys";
import { counterpartybankaccountService } from "../../services/counterpartybankaccountService";

export const useGetListCounterpartybankaccount = (params?: URLSearchParams) =>
  useQuery({
    queryKey: settingsKeys.counterpartyBankAccount.list(params),
    queryFn: () => counterpartybankaccountService.list(params as any),
    // placeholderData: keepPreviousData,
  });
