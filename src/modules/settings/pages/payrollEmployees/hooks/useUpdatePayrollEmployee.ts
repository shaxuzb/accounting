import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollEmployeeService } from "../api";
import { payrollEmployeeKeys } from "../constants/queryKeys";
import type { PayrollEmployeeMainForm } from "../types/form";

interface UpdateArgs {
  id: string | number;
  payload: PayrollEmployeeMainForm;
}

export const useUpdatePayrollEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      payrollEmployeeService.update(id, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: payrollEmployeeKeys.all }),
        queryClient.invalidateQueries({
          queryKey: payrollEmployeeKeys.detail(variables.id),
        }),
      ]);
    },
  });
};
