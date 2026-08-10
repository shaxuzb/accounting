import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fiscalCashRegisterService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { FiscalCashRegisterForm } from "../types/form";

interface UpdateFiscalCashRegisterArgs {
  id: string | number;
  payload: FiscalCashRegisterForm;
}

export const useUpdateFiscalCashRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateFiscalCashRegisterArgs) =>
      fiscalCashRegisterService.update(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.all }),
  });
};
