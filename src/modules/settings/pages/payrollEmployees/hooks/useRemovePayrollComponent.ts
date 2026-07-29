import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollEmployeeService } from "../api";
import { payrollEmployeeKeys } from "../constants/queryKeys";

export const useRemovePayrollComponent = (employeeId: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string | number) =>
      payrollEmployeeService.removeComponent(employeeId, assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: payrollEmployeeKeys.detail(employeeId),
      });
    },
  });
};
