import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faRevaluationService } from "../api";

export const useConfirmFaRevaluation = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => faRevaluationService.confirm(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.detail(id),
      });
    },
  });
};
