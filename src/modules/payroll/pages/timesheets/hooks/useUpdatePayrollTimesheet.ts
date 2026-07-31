import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollTimesheetKeys } from "../constants/queryKeys";
import { payrollTimesheetService } from "../services/payrollTimesheetService";
import type { PayrollTimesheetForm } from "../types/form";

export const useUpdatePayrollTimesheet = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayrollTimesheetForm) =>
      payrollTimesheetService.update(id, payload),
    onSuccess: async () => {
      const updated = await payrollTimesheetService.detail(id);
      queryClient.setQueryData(payrollTimesheetKeys.detail(id), updated);
      await queryClient.invalidateQueries({
        queryKey: payrollTimesheetKeys.list(),
      });
    },
  });
};
