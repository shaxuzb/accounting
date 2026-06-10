import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { counterpartybankaccountService } from "../../services/counterpartybankaccountService";
import type { CounterpartybankaccountForm } from "../../types/form";


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
        queryKey: settingsKeys.counterpartyBankAccount.all,
      });
      queryClient.invalidateQueries({
        queryKey: settingsKeys.counterpartyBankAccount.detail(variables.id),
      });
    },
  });
};
