import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { counterpartyService } from "../api";
import type { CounterpartyForm } from "../types/form";

interface UpdateArgs {
  id: string | number;
  payload: Partial<CounterpartyForm>;
}

export const useUpdateCounteryParty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      counterpartyService.update(id, payload),
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
