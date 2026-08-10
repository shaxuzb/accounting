import { useMutation, useQueryClient } from "@tanstack/react-query";
import { retailSaleKeys } from "../constants/queryKeys";
import { retailSaleService } from "../services/retailSaleService";

export const useCancelRetailSale = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => retailSaleService.cancel(id),
    onSuccess: (data) => {
      queryClient.setQueryData(retailSaleKeys.detail(id), data);
      void queryClient.invalidateQueries({ queryKey: retailSaleKeys.all });
    },
  });
};
