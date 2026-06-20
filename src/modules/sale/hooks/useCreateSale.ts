import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saleKeys } from "../constants/queryKeys";
import { saleService } from "../services/saleService";
import type { SaleDocForm } from "../types/type";

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaleDocForm) => saleService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.docs.all });
    },
  });
};
