import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chartAccountsService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { CreateChartAccountsFromPresetItem } from "../types/preset";

export const useCreateChartAccountsFromPreset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateChartAccountsFromPresetItem[]) =>
      chartAccountsService.createFromPreset(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
