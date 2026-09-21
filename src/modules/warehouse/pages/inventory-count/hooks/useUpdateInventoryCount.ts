import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryCountKeys } from "../constants/queryKeys";
import { inventoryCountService } from "../services/inventoryCountService";
import type { InventoryCountUpdatePayload } from "../types/form";

export const useUpdateInventoryCount = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InventoryCountUpdatePayload) =>
      inventoryCountService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryCountKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: inventoryCountKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryCountKeys.list() });
    },
  });
};
