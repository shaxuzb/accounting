import { useQuery } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { orgBankAccountsService } from "../../services/orgBankAccountsService";

export const useGetDetailOrgBankAccounts = (id: string | number) =>
  useQuery({
    queryKey: settingsKeys.orgBankAccounts.detail(id),
    queryFn: () => orgBankAccountsService.detail(id),
    enabled: Boolean(id),
  });
