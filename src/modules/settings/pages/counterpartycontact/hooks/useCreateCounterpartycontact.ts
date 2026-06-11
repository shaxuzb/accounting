import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CounterpartyContactForm } from "../types/form";
import { counterpartycontactService } from "../api";
import { queryKeys } from "../constants/queryKeys";


export const useCreateCounterpartycontact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CounterpartyContactForm) => counterpartycontactService.create(payload),
    onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
