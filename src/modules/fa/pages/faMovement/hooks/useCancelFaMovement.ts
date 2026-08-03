import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faMovementService } from "../api";

export const useCancelFaMovement = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => faMovementService.cancel(id),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.detail(id), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
