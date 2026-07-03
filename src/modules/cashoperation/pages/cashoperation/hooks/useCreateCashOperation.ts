import { useMutation } from "@tanstack/react-query";
import type { CashOperationForm } from "../types/form";
import { cashOperationService } from "../services/cashOperationService";

export const useCreateCashOperation = () =>
  useMutation({
    mutationFn: (payload: CashOperationForm) =>
      cashOperationService.create(payload),
  });
