import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { counterpartybankaccountService } from "../api";
import type { CounterpartybankaccountForm } from "../types/form";

export const useCreateCounterpartybankaccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CounterpartybankaccountForm) =>
      counterpartybankaccountService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.all,
      });
    },
  });
};
