import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { orgBankAccountsService } from "../../services/orgBankAccountsService";
import type { OrgBankAccountsForm } from "../../types/form";

export const useCreateOrgBankAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrgBankAccountsForm) =>
      orgBankAccountsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.orgBankAccounts.all,
      });
    },
  });
};
