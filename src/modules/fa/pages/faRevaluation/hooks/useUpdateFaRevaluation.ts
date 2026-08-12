import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faRevaluationService } from "../api";
import type { FaRevaluationPayload } from "../types/type";

interface UpdateArgs {
  id: string | number;
  payload: FaRevaluationPayload;
}

export const useUpdateFaRevaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      faRevaluationService.update(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
