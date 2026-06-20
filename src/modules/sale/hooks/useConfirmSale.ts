import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saleKeys } from "../constants/queryKeys";
import { saleService } from "../services/saleService";
import type { SaleDocConfirmForm } from "../types/type";

export const useConfirmSale = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaleDocConfirmForm) => saleService.confirm(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.docs.all });
      queryClient.invalidateQueries({ queryKey: saleKeys.docs.detail(id) });
      queryClient.invalidateQueries({ queryKey: saleKeys.tables.list(id) });
    },
  });
};
