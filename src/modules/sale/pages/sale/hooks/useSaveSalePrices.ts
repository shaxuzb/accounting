import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saleKeys } from "../constants/queryKeys";
import { saleDocService } from "../services/saleDocService";
import type { SaleDocConfirmForm } from "../types/form";

/** Writes the prices onto the unposted sale; posting stays a separate step. */
export const useSaveSalePrices = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaleDocConfirmForm) =>
      saleDocService.savePrices(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.saleDoc.detail(id) });
      queryClient.invalidateQueries({
        queryKey: saleKeys.saleDocTable.list(id),
      });
    },
  });
};
