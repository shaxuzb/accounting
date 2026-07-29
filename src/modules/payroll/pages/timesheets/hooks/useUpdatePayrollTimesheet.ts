import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollTimesheetKeys } from "../constants/queryKeys";
import { payrollTimesheetService } from "../services/payrollTimesheetService";
import type { PayrollTimesheetForm } from "../types/form";

export const useUpdatePayrollTimesheet = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayrollTimesheetForm) =>
      payrollTimesheetService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollTimesheetKeys.all });
      queryClient.invalidateQueries({
        queryKey: payrollTimesheetKeys.detail(id),
      });
    },
  });
};
