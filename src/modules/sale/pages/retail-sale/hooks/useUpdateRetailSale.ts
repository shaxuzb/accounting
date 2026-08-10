import { useMutation, useQueryClient } from "@tanstack/react-query";
import { retailSaleKeys } from "../constants/queryKeys";
import { retailSaleService } from "../services/retailSaleService";
import type { RetailSaleUpdatePayload } from "../types/form";

export const useUpdateRetailSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: RetailSaleUpdatePayload;
    }) => retailSaleService.update(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: retailSaleKeys.all });
      void queryClient.invalidateQueries({
        queryKey: retailSaleKeys.detail(variables.id),
      });
    },
  });
};
