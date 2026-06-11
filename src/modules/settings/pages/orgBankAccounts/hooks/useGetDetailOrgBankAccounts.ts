import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { orgBankAccountsService } from "../api";

export const useGetDetailOrgBankAccounts = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => orgBankAccountsService.detail(id),
    enabled: Boolean(id),
  });
