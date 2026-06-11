import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { orgBankAccountsService } from "../api";
import type { OrgBankAccountsForm } from "../types/form";

export const useCreateOrgBankAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrgBankAccountsForm) =>
      orgBankAccountsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.all,
      });
    },
  });
};
