import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faDisposalService } from "../api";
import type { FaDisposalPayload, FaDisposalResponse } from "../types/type";

interface UpdateArgs {
  id: string | number;
  payload: FaDisposalPayload;
}

export const useUpdateFaDisposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      faDisposalService.update(id, payload),
    onSuccess: (data, variables) => {
      if (data && typeof data === "object") {
        queryClient.setQueryData<FaDisposalResponse>(
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
