import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseServiceService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { PurchaseServiceUpdate } from "../types/type";

interface UpdateArgs {
  id: string | number;
  payload: PurchaseServiceUpdate;
}

export const useUpdatePurchaseService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      purchaseServiceService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
