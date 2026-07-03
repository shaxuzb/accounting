import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryAdjustmentKeys } from "../constants/queryKeys";
import { inventoryAdjustmentService } from "../services/inventoryAdjustmentService";
import type { InventoryAdjustmentForm } from "../types/form";

export const useUpdateInventoryAdjustment = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InventoryAdjustmentForm) =>
      inventoryAdjustmentService.update(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(inventoryAdjustmentKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: inventoryAdjustmentKeys.all });
    },
  });
};
