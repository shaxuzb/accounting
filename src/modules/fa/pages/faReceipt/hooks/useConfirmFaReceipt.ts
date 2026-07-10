import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faReceiptService } from "../api";

export const useConfirmFaReceipt = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => faReceiptService.confirm(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.detail(id) });
    },
  });
};
