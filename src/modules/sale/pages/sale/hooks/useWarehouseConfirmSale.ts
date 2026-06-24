import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saleKeys } from "../constants/queryKeys";
import { saleDocService } from "../services/saleDocService";
import type { SaleDocWarehouseConfirmForm } from "../types/form";

export const useWarehouseConfirmSale = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaleDocWarehouseConfirmForm) =>
      saleDocService.warehouseConfirm(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.saleDoc.all });
      queryClient.invalidateQueries({ queryKey: saleKeys.saleDoc.detail(id) });
      queryClient.invalidateQueries({
        queryKey: saleKeys.saleDocTable.list(id),
      });
    },
  });
};
