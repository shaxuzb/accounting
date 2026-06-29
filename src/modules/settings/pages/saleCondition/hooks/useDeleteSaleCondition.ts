import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { saleConditionService } from "../api";

export const useDeleteSaleCondition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => saleConditionService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
