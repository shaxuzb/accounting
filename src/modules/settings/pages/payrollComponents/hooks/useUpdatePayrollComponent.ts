import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollComponentService } from "../api";
import { payrollComponentKeys } from "../constants/queryKeys";
import type { PayrollComponentForm } from "../types/form";

interface UpdateArgs {
  id: string | number;
  payload: PayrollComponentForm;
}

export const useUpdatePayrollComponent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      payrollComponentService.update(id, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: payrollComponentKeys.all }),
        queryClient.invalidateQueries({
          queryKey: payrollComponentKeys.detail(variables.id),
        }),
      ]);
    },
  });
};
