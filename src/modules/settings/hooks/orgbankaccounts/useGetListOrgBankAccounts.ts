import { keepPreviousData, useQuery } from "@tanstack/react-query";
// import type { ListParams } from "@/shared/types";
import { settingsKeys } from "../../constants/queryKeys";
import { orgBankAccountsService } from "../../services/orgBankAccountsService";

export const useGetListOrgBankAccounts = (params?: URLSearchParams) =>
  useQuery({
    queryKey: settingsKeys.orgBankAccounts.list(params),
    queryFn: () => orgBankAccountsService.list(params as any),
    placeholderData: keepPreviousData,
  });
