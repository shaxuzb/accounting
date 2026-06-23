import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saleKeys } from "../constants/queryKeys";
import { saleDocService } from "../services/saleDocService";
import type { SaleDocUpdateForm } from "../types/form";

interface UpdateArgs {
  id: string | number;
  payload: SaleDocUpdateForm;
}

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      saleDocService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.saleDoc.all });
      queryClient.invalidateQueries({
        queryKey: saleKeys.saleDoc.detail(variables.id),
      });
    },
  });
};
