import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faReceiptService } from "../api";
import type { FaReceiptPayload } from "../types/type";

export const useCreateFaReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FaReceiptPayload) =>
      faReceiptService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
