import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { pricingConditionService } from "../api";

export const useDeletePricingCondition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => pricingConditionService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
