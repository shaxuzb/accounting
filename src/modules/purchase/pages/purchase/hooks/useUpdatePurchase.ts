import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PurchaseForm } from "../types/type";
import { purchaseService } from "../services/purchaseService";
import { purchaseKeys } from "../constants/queryKeys";

interface UpdateArgs {
  id: string | number;
  payload: Partial<PurchaseForm>;
}

export const useUpdatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      purchaseService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: purchaseKeys.purchase.all,
      });
      queryClient.invalidateQueries({
        queryKey: purchaseKeys.purchase.detail(variables.id),
      });
    },
  });
};
