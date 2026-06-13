import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { WarehouseForm } from "../types/form";
import { warehouseService } from "../api";
import { queryKeys } from "../constants/queryKey";

interface UpdateArgs {
  id: string | number;
  payload: Partial<WarehouseForm>;
}

export const useUpdateWarehouses = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      warehouseService.update(id, payload),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.all,
      });
      // queryClient.invalidateQueries({
      //   queryKey: queryKeys.detail(variables.id),
      // });
    },
  });
};
