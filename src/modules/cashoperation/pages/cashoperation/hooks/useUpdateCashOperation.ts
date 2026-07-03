import { useMutation } from "@tanstack/react-query";
import type { CashOperationForm } from "../types/form";
import { cashOperationService } from "../services/cashOperationService";

export const useUpdateCashOperation = () =>
  useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: Partial<CashOperationForm>;
    }) => cashOperationService.update(id, payload),
  });
