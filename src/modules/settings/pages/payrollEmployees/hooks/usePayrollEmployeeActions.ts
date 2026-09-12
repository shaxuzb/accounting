import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollEmployeeService } from "../api";
import { payrollEmployeeKeys } from "../constants/queryKeys";
import type { PayrollEmploymentDismissForm, PayrollEmploymentPayChangeForm, PayrollEmploymentTransferForm } from "../types/form";

export const usePayrollEmployeeActions = (employeeId: string | number) => {
  const queryClient = useQueryClient();
  const invalidate = async () => Promise.all([
    queryClient.invalidateQueries({ queryKey: payrollEmployeeKeys.detail(employeeId) }),
    queryClient.invalidateQueries({ queryKey: [...payrollEmployeeKeys.detail(employeeId), "history"] }),
    queryClient.invalidateQueries({ queryKey: payrollEmployeeKeys.all }),
  ]);
  return {
    transfer: useMutation({ mutationFn: (payload: PayrollEmploymentTransferForm) => payrollEmployeeService.transfer(employeeId, payload), onSuccess: invalidate }),
    changePay: useMutation({ mutationFn: (payload: PayrollEmploymentPayChangeForm) => payrollEmployeeService.changePay(employeeId, payload), onSuccess: invalidate }),
    dismiss: useMutation({ mutationFn: (payload: PayrollEmploymentDismissForm) => payrollEmployeeService.dismiss(employeeId, payload), onSuccess: invalidate }),
  };
};
