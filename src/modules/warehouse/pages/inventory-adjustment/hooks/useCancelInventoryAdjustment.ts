import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryAdjustmentKeys } from "../constants/queryKeys";
import { inventoryAdjustmentService } from "../services/inventoryAdjustmentService";

export const useCancelInventoryAdjustment = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => inventoryAdjustmentService.cancel(id),
    onSuccess: (data) => {
      queryClient.setQueryData(inventoryAdjustmentKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: inventoryAdjustmentKeys.all });
    },
  });
};
