import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import type { CashBoxForm } from "../types/form";
import { cashBoxService } from "../api";


interface UpdateArgs {
  id: string | number;
  payload: Partial<CashBoxForm>;
}

export const useUpdateCashBox = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      cashBoxService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.detail(variables.id),
      });
    },
  });
};
