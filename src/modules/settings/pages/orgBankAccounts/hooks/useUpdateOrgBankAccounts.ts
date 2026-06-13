import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { orgBankAccountsService } from "../api";
import type { OrgBankAccountsForm } from "../types/form";

interface UpdateArgs {
  id: string | number;
  payload: Partial<OrgBankAccountsForm>;
}

export const useUpdateOrgBankAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      orgBankAccountsService.update(id, payload),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.all,
      });
      // queryClient.invalidateQueries({
      //   queryKey: queryKeys.detail(variables.id),
      // });
    },
  });
};
