import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollComponentService } from "../api";
import { payrollComponentKeys } from "../constants/queryKeys";
import type { PayrollComponentForm } from "../types/form";

export const useCreatePayrollComponent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayrollComponentForm) =>
      payrollComponentService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollComponentKeys.all });
    },
  });
};
