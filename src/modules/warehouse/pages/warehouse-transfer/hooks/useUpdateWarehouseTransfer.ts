import { useMutation, useQueryClient } from "@tanstack/react-query";
import { warehouseTransferKeys } from "../constants/queryKeys";
import { warehouseTransferService } from "../services/warehouseTransferService";
import type { WarehouseTransferForm } from "../types/form";

export const useUpdateWarehouseTransfer = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WarehouseTransferForm) =>
      warehouseTransferService.update(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(warehouseTransferKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: warehouseTransferKeys.all });
    },
  });
};
