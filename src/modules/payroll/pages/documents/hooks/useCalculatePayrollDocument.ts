import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollDocumentKeys } from "../constants/queryKeys";
import { payrollDocumentService } from "../services/payrollDocumentService";
import type { PayrollCalculateForm } from "../types/form";

export const useCalculatePayrollDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayrollCalculateForm) =>
      payrollDocumentService.calculate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollDocumentKeys.all });
    },
  });
};
