import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { counterpartyService } from "../api";
import type { CounterpartyForm } from "../types/form";

export const useCreateCounteryParty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CounterpartyForm) =>
      counterpartyService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.all,
      });
    },
  });
};
