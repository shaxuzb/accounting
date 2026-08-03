import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faMovementService } from "../api";

export const useConfirmFaMovement = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => faMovementService.confirm(id),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.detail(id), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
