import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cashOperationKeys } from "../constants/queryKeys";
import { cashOperationService } from "../services/cashOperationService";

export const useCancelCashOperation = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cashOperationService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashOperationKeys.list() });
      queryClient.invalidateQueries({ queryKey: cashOperationKeys.detail(id) });
    },
  });
};
