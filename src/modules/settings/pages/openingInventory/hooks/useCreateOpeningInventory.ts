import { useMutation, useQueryClient } from "@tanstack/react-query";
import { openingInventoryService } from "../services/openingInventoryService";
import { queryKeys } from "../constants/queryKeys";
import type { OpeningInventoryPayload } from "../types/form";

export const useCreateOpeningInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OpeningInventoryPayload) =>
      openingInventoryService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.all,
      });
    },
  });
};
