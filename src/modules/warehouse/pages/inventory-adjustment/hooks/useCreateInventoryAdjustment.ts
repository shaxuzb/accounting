import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryAdjustmentKeys } from "../constants/queryKeys";
import { inventoryAdjustmentService } from "../services/inventoryAdjustmentService";
import type { InventoryAdjustmentForm } from "../types/form";

export const useCreateInventoryAdjustment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InventoryAdjustmentForm) =>
      inventoryAdjustmentService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryAdjustmentKeys.all });
    },
  });
};
