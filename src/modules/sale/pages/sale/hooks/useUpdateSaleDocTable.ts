import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saleKeys } from "../constants/queryKeys";
import { saleDocTableService } from "../services/saleDocTableService";
import type { SaleDocTableUpdateForm } from "../types/form";

export const useUpdateSaleDocTable = (ownerId: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: SaleDocTableUpdateForm;
    }) => saleDocTableService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: saleKeys.saleDocTable.list(ownerId),
      });
    },
  });
};
