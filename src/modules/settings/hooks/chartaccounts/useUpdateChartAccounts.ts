import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { chartAccountsService } from "../../services/chartAccountsService";
import type { ChartAccountsForm } from "../../types/form";

interface UpdateArgs {
  id: string | number;
  payload: Partial<ChartAccountsForm>;
}

export const useUpdateChartAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      chartAccountsService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.chartAccounts.all,
      });
      queryClient.invalidateQueries({
        queryKey: settingsKeys.chartAccounts.detail(variables.id),
      });
    },
  });
};
