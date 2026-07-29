import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollTimesheetKeys } from "../constants/queryKeys";
import { payrollTimesheetService } from "../services/payrollTimesheetService";
import type { PayrollTimesheetForm } from "../types/form";

export const useCreatePayrollTimesheet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayrollTimesheetForm) =>
      payrollTimesheetService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollTimesheetKeys.all });
    },
  });
};
