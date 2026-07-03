import { useMutation, useQueryClient } from "@tanstack/react-query";
import { warehouseTransferKeys } from "../constants/queryKeys";
import { warehouseTransferService } from "../services/warehouseTransferService";

export const useConfirmWarehouseTransfer = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => warehouseTransferService.confirm(id),
    onSuccess: (data) => {
      queryClient.setQueryData(warehouseTransferKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: warehouseTransferKeys.all });
    },
  });
};
