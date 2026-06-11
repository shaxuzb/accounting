import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { WarehouseForm } from "../types/form";
import { queryKeys } from "../constants/queryKey";
import { warehouseService } from "../api";


export const useCreateWarehouses = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WarehouseForm) =>
      warehouseService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.all,
      });
    },
  });
};
