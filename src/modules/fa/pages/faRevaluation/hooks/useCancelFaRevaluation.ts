import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faRevaluationService } from "../api";

export const useCancelFaRevaluation = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => faRevaluationService.cancel(id),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.detail(id), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
