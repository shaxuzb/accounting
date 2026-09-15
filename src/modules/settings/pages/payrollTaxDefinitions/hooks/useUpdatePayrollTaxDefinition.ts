import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollTaxDefinitionService } from "../api";
import { payrollTaxDefinitionKeys } from "../constants/queryKeys";
import type { PayrollTaxDefinitionForm } from "../types/form";

interface UpdateArgs {
  id: string | number;
  payload: PayrollTaxDefinitionForm;
}

export const useUpdatePayrollTaxDefinition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      payrollTaxDefinitionService.update(id, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: payrollTaxDefinitionKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: payrollTaxDefinitionKeys.detail(variables.id),
        }),
      ]);
    },
  });
};
