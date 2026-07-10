import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faDisposalService } from "../api";

export const useCancelFaDisposal = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => faDisposalService.cancel(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.detail(id),
      });
    },
  });
};
