import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryCountKeys } from "../constants/queryKeys";
import { inventoryCountService } from "../services/inventoryCountService";

export const useConfirmInventoryCount = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => inventoryCountService.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryCountKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: inventoryCountKeys.all });
      queryClient.invalidateQueries({
        queryKey: inventoryCountKeys.differences(id),
      });
      queryClient.invalidateQueries({
        queryKey: inventoryCountKeys.postingBatches(id),
      });
      queryClient.invalidateQueries({
        queryKey: inventoryCountKeys.inventoryMovements(id),
      });
    },
  });
};
