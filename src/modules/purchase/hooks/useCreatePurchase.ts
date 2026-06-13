import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseKeys } from "../constants/queryKeys";
import { purchaseService } from "../services/purchaseService";
import type { PurchaseImportForm } from "../types/form";

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PurchaseImportForm) =>
      purchaseService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.purchase.all });
    },
  });
};
