import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollTimesheetKeys } from "../constants/queryKeys";
import { payrollTimesheetService } from "../services/payrollTimesheetService";

export const useCancelPayrollTimesheet = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => payrollTimesheetService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollTimesheetKeys.all });
      queryClient.invalidateQueries({
        queryKey: payrollTimesheetKeys.detail(id),
      });
    },
  });
};
