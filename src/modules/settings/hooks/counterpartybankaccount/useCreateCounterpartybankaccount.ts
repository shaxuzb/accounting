import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { counterpartybankaccountService } from "../../services/counterpartybankaccountService";
import type { CounterpartybankaccountForm } from "../../types/form";

export const useCreateCounterpartybankaccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CounterpartybankaccountForm) =>
      counterpartybankaccountService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.counterpartyBankAccount.all,
      });
    },
  });
};
