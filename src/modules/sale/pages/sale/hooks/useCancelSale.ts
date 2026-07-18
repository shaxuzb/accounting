import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saleKeys } from "../constants/queryKeys";
import { saleDocService } from "../services/saleDocService";

export const useCancelSale = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => saleDocService.cancel(id),
    onSuccess: (data) => {
      queryClient.setQueryData(saleKeys.saleDoc.detail(id), data);
      queryClient.invalidateQueries({ queryKey: saleKeys.saleDoc.all });
      queryClient.invalidateQueries({ queryKey: saleKeys.saleDoc.detail(id) });
      queryClient.invalidateQueries({
        queryKey: saleKeys.saleDocTable.list(id),
      });
    },
  });
};
