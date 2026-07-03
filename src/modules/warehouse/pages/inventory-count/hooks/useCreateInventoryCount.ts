import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryCountKeys } from "../constants/queryKeys";
import { inventoryCountService } from "../services/inventoryCountService";
import type { InventoryCountForm } from "../types/form";

export const useCreateInventoryCount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InventoryCountForm) =>
      inventoryCountService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryCountKeys.all });
    },
  });
};
