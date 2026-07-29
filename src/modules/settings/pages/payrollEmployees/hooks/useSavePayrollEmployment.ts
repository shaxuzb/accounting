import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollEmployeeService } from "../api";
import { payrollEmployeeKeys } from "../constants/queryKeys";
import type { PayrollEmploymentForm } from "../types/form";

interface SaveArgs {
  employmentId?: number | null;
  payload: PayrollEmploymentForm;
}

/** Yangi ish sharti qo'shadi yoki mavjudini yangilaydi. */
export const useSavePayrollEmployment = (employeeId: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employmentId, payload }: SaveArgs) =>
      employmentId
        ? payrollEmployeeService.updateEmployment(
            employeeId,
            employmentId,
            payload,
          )
        : payrollEmployeeService.createEmployment(employeeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: payrollEmployeeKeys.detail(employeeId),
      });
      queryClient.invalidateQueries({ queryKey: payrollEmployeeKeys.all });
    },
  });
};
