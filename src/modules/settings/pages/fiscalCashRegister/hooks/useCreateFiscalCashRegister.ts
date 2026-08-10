import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fiscalCashRegisterService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { FiscalCashRegisterForm } from "../types/form";

export const useCreateFiscalCashRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FiscalCashRegisterForm) =>
      fiscalCashRegisterService.create(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.all }),
  });
};
