import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { pricingConditionService } from "../api";
import type { PricingConditionForm } from "../types/form";

export const useCreatePricingCondition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PricingConditionForm) =>
      pricingConditionService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
