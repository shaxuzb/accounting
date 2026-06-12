import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseKeys } from "../constants/queryKeys";
import { purchaseService } from "../services/purchaseService";
import type { PurchaseForm } from "../types/type";

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PurchaseForm) => purchaseService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchaseKeys.purchase.all });
    },
  });
};
