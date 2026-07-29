import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollPeriodKeys } from "../constants/queryKeys";
import { payrollPeriodService } from "../services/payrollPeriodService";

export const useReopenPayrollPeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => payrollPeriodService.reopen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollPeriodKeys.all });
    },
  });
};
