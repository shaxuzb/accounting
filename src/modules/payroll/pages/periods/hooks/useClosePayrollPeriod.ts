import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollPeriodKeys } from "../constants/queryKeys";
import { payrollPeriodService } from "../services/payrollPeriodService";

export const useClosePayrollPeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => payrollPeriodService.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollPeriodKeys.all });
    },
  });
};
