import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saleKeys } from "../constants/queryKeys";
import { saleDocService } from "../services/saleDocService";
import type { SaleDocCreateForm } from "../types/form";

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaleDocCreateForm) => saleDocService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.saleDoc.all });
    },
  });
};
