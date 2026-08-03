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
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.detail(variables.id), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
