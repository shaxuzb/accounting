import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseKeys } from "../constants/queryKeys";
import { purchaseService } from "../services/purchaseService";
import type { PurchaseForm } from "../types/type";

interface UpdateArgs {
  id: string | number;
  payload: Partial<PurchaseForm>;
}

export const useUpdatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) => purchaseService.update(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: purchaseKeys.purchase.all });
      void queryClient.invalidateQueries({ queryKey: purchaseKeys.purchase.detail(variables.id) });
    },
  });
};
