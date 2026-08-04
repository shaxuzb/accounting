import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faRevaluationService } from "../api";

export const useConfirmFaRevaluation = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetId?: string | number) =>
      faRevaluationService.confirm(targetId ?? id),
    onSuccess: (data, targetId) => {
      queryClient.setQueryData(queryKeys.detail(targetId ?? id), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
