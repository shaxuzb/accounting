import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { counterpartyService } from "../../services/counterpartyService";
import type { CounterpartyForm } from "../../types/form";

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
        queryKey: settingsKeys.counterparty.all,
      });
      queryClient.invalidateQueries({
        queryKey: settingsKeys.counterparty.detail(variables.id),
      });
    },
  });
};
