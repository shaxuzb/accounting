import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faRevaluationService } from "../api";
import type { FaRevaluationFormValues } from "../types/form";

export const useCreateFaRevaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FaRevaluationFormValues) =>
      faRevaluationService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
