import { useMutation, useQueryClient } from "@tanstack/react-query";
import { retailSaleKeys } from "../constants/queryKeys";
import { retailSaleService } from "../services/retailSaleService";
import type { RetailSaleConfirmPayload } from "../types/form";

export const useConfirmRetailSale = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RetailSaleConfirmPayload) =>
      retailSaleService.confirm(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(retailSaleKeys.detail(id), data);
      void queryClient.invalidateQueries({ queryKey: retailSaleKeys.all });
    },
  });
};
