import { useMutation, useQueryClient } from "@tanstack/react-query";
import { openingInventoryService } from "../services/openingInventoryService";
import { queryKeys } from "../constants/queryKeys";

export const useDeleteOpeningInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: openingInventoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.all,
      });
    },
  });
};
