import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryCountKeys } from "../constants/queryKeys";
import { inventoryCountService } from "../services/inventoryCountService";

export const useConfirmInventoryCount = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => inventoryCountService.confirm(id),
    onSuccess: (data) => {
      queryClient.setQueryData(inventoryCountKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: inventoryCountKeys.all });
    },
  });
};
