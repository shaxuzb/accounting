import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryAdjustmentKeys } from "../constants/queryKeys";
import { inventoryAdjustmentService } from "../services/inventoryAdjustmentService";
import type { InventoryAdjustmentForm } from "../types/form";

export const useUpdateInventoryAdjustment = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InventoryAdjustmentForm) =>
      inventoryAdjustmentService.update(id, payload),
    onSuccess: () => {
      // 204 javobda tana yo'q: setQueryData(undefined) keshdagi hujjatni
      // o'chirib yuborardi. Qayta so'rash yetarli.
      void queryClient.invalidateQueries({ queryKey: inventoryAdjustmentKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: inventoryAdjustmentKeys.all });
    },
  });
};
