import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bankTerminalService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { BankTerminalForm } from "../types/form";

interface UpdateBankTerminalArgs {
  id: string | number;
  payload: BankTerminalForm;
}

export const useUpdateBankTerminal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateBankTerminalArgs) =>
      bankTerminalService.update(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.all }),
  });
};
