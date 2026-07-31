import { useMutation, useQueryClient } from "@tanstack/react-query";
import { openingInventoryService } from "../services/openingInventoryService";
import { queryKeys } from "../constants/queryKeys";
import type { OpeningInventoryPayload } from "../types/form";

export const useUpdateOpeningInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: OpeningInventoryPayload;
    }) => openingInventoryService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.all,
      });
    },
  });
};
