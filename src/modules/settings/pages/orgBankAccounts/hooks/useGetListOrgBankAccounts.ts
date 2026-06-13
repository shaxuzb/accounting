import { keepPreviousData, useQuery } from "@tanstack/react-query";
// import type { ListParams } from "@/shared/types";
import { queryKeys } from "../constants/queryKeys";
import { orgBankAccountsService } from "../api";

export const useGetListOrgBankAccounts = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params?.toString?.() ?? params),
    queryFn: () => orgBankAccountsService.list(params),
    placeholderData: keepPreviousData,
  });
