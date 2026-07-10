import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faReceiptService } from "../api";

export const useCreateFaReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      faReceiptService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
