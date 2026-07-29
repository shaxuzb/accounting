import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollPeriodKeys } from "../constants/queryKeys";
import { payrollPeriodService } from "../services/payrollPeriodService";
import type { PayrollPeriodForm } from "../types/form";

export const useCreatePayrollPeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayrollPeriodForm) =>
      payrollPeriodService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollPeriodKeys.all });
    },
  });
};
