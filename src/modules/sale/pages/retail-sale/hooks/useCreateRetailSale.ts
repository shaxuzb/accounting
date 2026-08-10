import { useMutation, useQueryClient } from "@tanstack/react-query";
import { retailSaleKeys } from "../constants/queryKeys";
import { retailSaleService } from "../services/retailSaleService";
import type { RetailSaleCreatePayload } from "../types/form";

export const useCreateRetailSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RetailSaleCreatePayload) =>
      retailSaleService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: retailSaleKeys.all });
    },
  });
};
