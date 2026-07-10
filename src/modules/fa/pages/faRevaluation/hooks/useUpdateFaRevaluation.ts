import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faRevaluationService } from "../api";
import type { FaRevaluationFormValues } from "../types/form";

interface UpdateArgs {
  id: string | number;
  payload: FaRevaluationFormValues;
}

export const useUpdateFaRevaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      faRevaluationService.update(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.detail(variables.id),
      });
    },
  });
};
