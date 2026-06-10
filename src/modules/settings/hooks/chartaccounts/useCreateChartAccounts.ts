import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { chartAccountsService } from "../../services/chartAccountsService";
import type { ChartAccountsForm } from "../../types/form";

export const useCreateChartAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChartAccountsForm) =>
      chartAccountsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.chartAccounts.all,
      });
    },
  });
};
