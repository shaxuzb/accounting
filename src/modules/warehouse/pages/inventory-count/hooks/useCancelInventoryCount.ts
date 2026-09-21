import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryCountKeys } from "../constants/queryKeys";
import { inventoryCountService } from "../services/inventoryCountService";

export const useCancelInventoryCount = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => inventoryCountService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryCountKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: inventoryCountKeys.all });
      queryClient.invalidateQueries({
        queryKey: inventoryCountKeys.list(),
      });
    },
  });
};
