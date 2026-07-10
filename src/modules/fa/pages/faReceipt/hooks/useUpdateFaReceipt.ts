import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faReceiptService } from "../api";

interface UpdateArgs {
  id: string | number;
  payload: Record<string, unknown>;
}

export const useUpdateFaReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      faReceiptService.update(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.detail(variables.id),
      });
    },
  });
};
