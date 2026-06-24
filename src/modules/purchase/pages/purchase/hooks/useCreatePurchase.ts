import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PurchaseCreatePayload } from "../types/form";
import { purchaseService } from "../services/purchaseService";
import { purchaseKeys } from "../constants/queryKeys";


export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PurchaseCreatePayload) =>
      purchaseService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.purchase.all });
    },
  });
};
