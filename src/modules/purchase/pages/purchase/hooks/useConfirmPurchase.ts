import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseKeys } from "../constants/queryKeys";
import { purchaseService } from "../services/purchaseService";

export const useConfirmPurchase = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => purchaseService.confirm(id),
    onSuccess: (data) => {
      queryClient.setQueryData(purchaseKeys.purchase.detail(id), data);
      queryClient.invalidateQueries({ queryKey: purchaseKeys.purchase.all });
    },
  });
};
