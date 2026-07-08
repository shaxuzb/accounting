import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryCountKeys } from "../constants/queryKeys";
import { inventoryCountService } from "../services/inventoryCountService";

export const useDeleteInventoryCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => inventoryCountService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryCountKeys.all });
    },
  });
};
