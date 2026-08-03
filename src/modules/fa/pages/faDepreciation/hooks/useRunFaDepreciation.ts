import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faDepreciationService } from "../api";
import type { FaDepreciationRun } from "../types/type";

export const useRunFaDepreciation = () => {
  const queryClient = useQueryClient();

  return useMutation<FaDepreciationRun, unknown, void>({
    mutationFn: () =>
      faDepreciationService.run({} as Record<string, unknown>),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
