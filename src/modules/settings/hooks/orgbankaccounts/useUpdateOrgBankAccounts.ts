import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { orgBankAccountsService } from "../../services/orgBankAccountsService";
import type { OrgBankAccountsForm } from "../../types/form";

interface UpdateArgs {
  id: string | number;
  payload: Partial<OrgBankAccountsForm>;
}

export const useUpdateOrgBankAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      orgBankAccountsService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.orgBankAccounts.all,
      });
      queryClient.invalidateQueries({
        queryKey: settingsKeys.orgBankAccounts.detail(variables.id),
      });
    },
  });
};
