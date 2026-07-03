import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryCountKeys } from "../constants/queryKeys";
import { inventoryCountService } from "../services/inventoryCountService";
import type { InventoryCountForm } from "../types/form";

export const useUpdateInventoryCount = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InventoryCountForm) =>
      inventoryCountService.update(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(inventoryCountKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: inventoryCountKeys.all });
    },
  });
};
