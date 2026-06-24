import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseServiceService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { PurchaseServiceCreate } from "../types/type";

export const useCreatePurchaseService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PurchaseServiceCreate) =>
      purchaseServiceService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
