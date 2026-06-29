import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { saleConditionService } from "../api";
import type { SaleConditionForm } from "../types/form";

export const useCreateSaleCondition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaleConditionForm) =>
      saleConditionService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
