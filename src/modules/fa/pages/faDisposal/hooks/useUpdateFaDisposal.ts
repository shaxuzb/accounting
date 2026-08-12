import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faDisposalService } from "../api";
import type { FaDisposalPayload } from "../types/type";

interface UpdateArgs {
  id: string | number;
  payload: FaDisposalPayload;
}

export const useUpdateFaDisposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      faDisposalService.update(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
