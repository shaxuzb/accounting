import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryAdjustmentKeys } from "../constants/queryKeys";
import { inventoryAdjustmentService } from "../services/inventoryAdjustmentService";

export const useConfirmInventoryAdjustment = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => inventoryAdjustmentService.confirm(id),
    onSuccess: (data) => {
      queryClient.setQueryData(inventoryAdjustmentKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: inventoryAdjustmentKeys.all });
    },
  });
};
