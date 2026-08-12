import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faMovementService } from "../api";

export const useCancelFaMovement = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => faMovementService.cancel(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
