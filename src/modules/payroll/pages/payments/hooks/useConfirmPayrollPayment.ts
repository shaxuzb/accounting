import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollPaymentKeys } from "../constants/queryKeys";
import { payrollPaymentService } from "../services/payrollPaymentService";

export const useConfirmPayrollPayment = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => payrollPaymentService.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollPaymentKeys.all });
      queryClient.invalidateQueries({
        queryKey: payrollPaymentKeys.detail(id),
      });
    },
  });
};
