import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faReceiptService } from "../api";
import type { FaReceiptPayload } from "../types/type";

interface UpdateArgs {
  id: string | number;
  payload: FaReceiptPayload;
}

export const useUpdateFaReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      faReceiptService.update(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
