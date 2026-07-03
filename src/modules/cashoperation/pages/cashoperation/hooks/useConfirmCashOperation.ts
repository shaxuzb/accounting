import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cashOperationKeys } from "../constants/queryKeys";
import { cashOperationService } from "../services/cashOperationService";

export const useConfirmCashOperation = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cashOperationService.confirm(id),
    onSuccess: (data) => {
      queryClient.setQueryData(cashOperationKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: cashOperationKeys.list() });
      queryClient.invalidateQueries({ queryKey: cashOperationKeys.detail(id) });
    },
  });
};
