import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faDisposalService } from "../api";
import type { FaDisposalFormValues } from "../types/form";

interface UpdateArgs {
  id: string | number;
  payload: FaDisposalFormValues;
}

export const useUpdateFaDisposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      faDisposalService.update(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.detail(variables.id),
      });
    },
  });
};
