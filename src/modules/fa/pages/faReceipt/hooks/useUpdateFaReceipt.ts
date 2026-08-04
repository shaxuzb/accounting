import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faReceiptService } from "../api";
import type { FaReceiptPayload, FaReceiptResponse } from "../types/type";

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
      if (data && typeof data === "object") {
        queryClient.setQueryData<FaReceiptResponse>(
          queryKeys.detail(variables.id),
          (current) => ({
            ...current,
            ...data,
            id: data.id ?? current?.id ?? Number(variables.id),
          }),
        );
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
