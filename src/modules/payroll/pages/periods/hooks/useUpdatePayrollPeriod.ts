import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollPeriodKeys } from "../constants/queryKeys";
import { payrollPeriodService } from "../services/payrollPeriodService";
import type { PayrollPeriodForm } from "../types/form";

export const useUpdatePayrollPeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: PayrollPeriodForm }) =>
      payrollPeriodService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: payrollPeriodKeys.all });
    },
  });
};
