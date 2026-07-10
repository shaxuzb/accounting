import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faDisposalService } from "../api";
import type { FaDisposalFormValues } from "../types/form";

export const useCreateFaDisposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FaDisposalFormValues) =>
      faDisposalService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
