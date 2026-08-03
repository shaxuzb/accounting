import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faDisposalService } from "../api";
import type { FaDisposalPayload } from "../types/type";

export const useCreateFaDisposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FaDisposalPayload) =>
      faDisposalService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
