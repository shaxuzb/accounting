import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saleKeys } from "../constants/queryKeys";
import { saleService } from "../services/saleService";
import type { SaleDocUpdateForm } from "../types/type";

interface UpdateArgs {
  id: string | number;
  payload: SaleDocUpdateForm;
}

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      saleService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.docs.all });
      queryClient.invalidateQueries({
        queryKey: saleKeys.docs.detail(variables.id),
      });
    },
  });
};
