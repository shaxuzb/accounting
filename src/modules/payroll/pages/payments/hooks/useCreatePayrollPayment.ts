import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollPaymentKeys } from "../constants/queryKeys";
import { payrollPaymentService } from "../services/payrollPaymentService";
import type { PayrollPaymentForm } from "../types/form";

export const useCreatePayrollPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayrollPaymentForm) =>
      payrollPaymentService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollPaymentKeys.all });
    },
  });
};
