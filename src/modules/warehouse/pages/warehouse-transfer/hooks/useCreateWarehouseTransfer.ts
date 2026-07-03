import { useMutation, useQueryClient } from "@tanstack/react-query";
import { warehouseTransferKeys } from "../constants/queryKeys";
import { warehouseTransferService } from "../services/warehouseTransferService";
import type { WarehouseTransferForm } from "../types/form";

export const useCreateWarehouseTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WarehouseTransferForm) =>
      warehouseTransferService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseTransferKeys.all });
    },
  });
};
