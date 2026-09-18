import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryAdjustmentKeys } from "../constants/queryKeys";
import { inventoryAdjustmentService } from "../services/inventoryAdjustmentService";

export const useCancelInventoryAdjustment = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => inventoryAdjustmentService.cancel(id),
    onSuccess: () => {
      // 204 javobda tana yo'q: setQueryData(undefined) keshdagi hujjatni
      // o'chirib yuborardi. Qayta so'rash yetarli.
      void queryClient.invalidateQueries({ queryKey: inventoryAdjustmentKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: inventoryAdjustmentKeys.all });
    },
  });
};
