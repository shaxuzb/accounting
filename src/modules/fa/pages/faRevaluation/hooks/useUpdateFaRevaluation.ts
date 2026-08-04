import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faRevaluationService } from "../api";
import type { FaRevaluation, FaRevaluationPayload } from "../types/type";

interface UpdateArgs {
  id: string | number;
  payload: FaRevaluationPayload;
}

export const useUpdateFaRevaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      faRevaluationService.update(id, payload),
    onSuccess: (data, variables) => {
      if (data && typeof data === "object") {
        queryClient.setQueryData<FaRevaluation>(
          queryKeys.detail(variables.id),
          (current) => ({
            ...current,
            ...data,
            id: data.id ?? current?.id ?? Number(variables.id),
          }),
        );
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
