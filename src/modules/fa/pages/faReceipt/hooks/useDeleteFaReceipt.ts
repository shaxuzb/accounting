import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faReceiptService } from "../api";

export const useDeleteFaReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => faReceiptService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
