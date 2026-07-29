import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollEmployeeService } from "../api";
import { payrollEmployeeKeys } from "../constants/queryKeys";
import type { PayrollEmployeeForm } from "../types/form";

export const useCreatePayrollEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayrollEmployeeForm) =>
      payrollEmployeeService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollEmployeeKeys.all });
    },
  });
};
