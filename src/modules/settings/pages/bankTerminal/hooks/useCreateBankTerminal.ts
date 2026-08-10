import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bankTerminalService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { BankTerminalCreatePayload } from "../types/form";

export const useCreateBankTerminal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BankTerminalCreatePayload) =>
      bankTerminalService.create(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.all }),
  });
};
