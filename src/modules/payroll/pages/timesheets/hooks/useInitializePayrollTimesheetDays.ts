import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollTimesheetKeys } from "../constants/queryKeys";
import { payrollTimesheetService } from "../services/payrollTimesheetService";

export const useInitializePayrollTimesheetDays = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => payrollTimesheetService.initializeDays(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: payrollTimesheetKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: payrollTimesheetKeys.list() });
    },
  });
};
