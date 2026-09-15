import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollTaxDefinitionService } from "../api";
import { payrollTaxDefinitionKeys } from "../constants/queryKeys";
import type { PayrollTaxDefinitionForm } from "../types/form";

export const useCreatePayrollTaxDefinition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayrollTaxDefinitionForm) =>
      payrollTaxDefinitionService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: payrollTaxDefinitionKeys.all,
      });
    },
  });
};
