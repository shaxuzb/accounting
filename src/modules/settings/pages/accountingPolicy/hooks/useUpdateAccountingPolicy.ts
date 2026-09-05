import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountingPolicyService } from "../api";
import { accountingPolicyQueryKeys } from "../constants/queryKeys";
import type { AccountingPolicyUpdateRequest } from "../types/type";

export const useUpdateAccountingPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AccountingPolicyUpdateRequest) =>
      accountingPolicyService.update(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: accountingPolicyQueryKeys.all,
      });
    },
  });
};
