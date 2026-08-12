import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faMovementService } from "../api";

export const useConfirmFaMovement = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetId?: string | number) =>
      faMovementService.confirm(targetId ?? id),
    onSuccess: (_, targetId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.detail(targetId ?? id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
