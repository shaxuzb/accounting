import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faRevaluationService } from "../api";
import type { FaRevaluationPayload } from "../types/type";

export const useCreateFaRevaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FaRevaluationPayload) =>
      faRevaluationService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
