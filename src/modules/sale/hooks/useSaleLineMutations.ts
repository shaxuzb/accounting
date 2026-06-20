import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saleKeys } from "../constants/queryKeys";
import { saleService } from "../services/saleService";
import type { SaleDocTableForm } from "../types/type";

interface UpdateLineArgs {
  id: string | number;
  payload: SaleDocTableForm;
}

export const useCreateSaleLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaleDocTableForm) => saleService.createLine(payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({
        queryKey: saleKeys.tables.list(payload.ownerId),
      });
    },
  });
};

export const useUpdateSaleLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateLineArgs) =>
      saleService.updateLine(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: saleKeys.tables.list(variables.payload.ownerId),
      });
    },
  });
};

export const useDeleteSaleLine = (ownerId: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => saleService.deleteLine(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: saleKeys.tables.list(ownerId),
      });
    },
  });
};
