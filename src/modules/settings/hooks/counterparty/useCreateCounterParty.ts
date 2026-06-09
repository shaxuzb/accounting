import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { counterpartyService } from "../../services/counterpartyService";
import type { CounterpartyForm } from "../../types/form";

export const useCreateCounteryParty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CounterpartyForm) =>
      counterpartyService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.counterparty.all,
      });
    },
  });
};
