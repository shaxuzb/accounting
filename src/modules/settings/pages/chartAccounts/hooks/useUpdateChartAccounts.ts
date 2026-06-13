import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { chartAccountsService } from "../api";
import type { ChartAccountsForm } from "../types/form";

interface UpdateArgs {
  id: string | number;
  payload: Partial<ChartAccountsForm>;
}

export const useUpdateChartAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      chartAccountsService.update(id, payload),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.all,
      });
      // queryClient.invalidateQueries({
      //   queryKey: queryKeys.detail(variables.id),
      // });
    },
  });
};
