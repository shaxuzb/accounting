import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { chartAccountsService } from "../api";
import type { ChartAccountsForm } from "../types/form";

export const useCreateChartAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChartAccountsForm) =>
      chartAccountsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.all,
      });
    },
  });
};
