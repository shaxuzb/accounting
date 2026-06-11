import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { counterpartybankaccountService } from "../api";
import type { CounterpartybankaccountForm } from "../types/form";


interface UpdateArgs {
  id: string | number;
  payload: Partial<CounterpartybankaccountForm>;
}

export const useUpdateCounterpartybankaccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      counterpartybankaccountService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.detail(variables.id),
      });
    },
  });
};
