import { useMutation, useQueryClient } from "@tanstack/react-query";
import { warehouseTransferKeys } from "../constants/queryKeys";
import { warehouseTransferService } from "../services/warehouseTransferService";

export const useCancelWarehouseTransfer = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => warehouseTransferService.cancel(id),
    onSuccess: (data) => {
      queryClient.setQueryData(warehouseTransferKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: warehouseTransferKeys.all });
    },
  });
};
