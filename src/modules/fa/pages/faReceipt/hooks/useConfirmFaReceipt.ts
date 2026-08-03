import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faReceiptService } from "../api";

export const useConfirmFaReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => faReceiptService.confirm(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData(queryKeys.detail(id), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
