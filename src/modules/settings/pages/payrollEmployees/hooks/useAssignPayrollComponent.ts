import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollEmployeeService } from "../api";
import { payrollEmployeeKeys } from "../constants/queryKeys";
import type { PayrollEmployeeComponentForm } from "../types/form";

export const useAssignPayrollComponent = (employeeId: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayrollEmployeeComponentForm) =>
      payrollEmployeeService.assignComponent(employeeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: payrollEmployeeKeys.detail(employeeId),
      });
    },
  });
};
