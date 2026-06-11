import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CounterpartyContactForm } from "../types/form";
import { queryKeys } from "../constants/queryKeys";
import { counterpartycontactService } from "../api";

interface UpdateArgs {
  id: string | number;
  payload: Partial<CounterpartyContactForm>;
}

export const useUpdateCounterpartycontact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      counterpartycontactService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.detail(variables.id),
      });
    },
  });
};
