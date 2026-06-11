import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productsKeys } from "../constants/queryKeys";
import { productsService } from "../services/productsService";
import type { ProductsForm } from "../types/products";

interface UpdateArgs {
  id: string | number;
  payload: Partial<ProductsForm>;
}

export const useUpdateProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) => productsService.update(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: productsKeys.products.all });
      void queryClient.invalidateQueries({ queryKey: productsKeys.products.detail(variables.id) });
    },
  });
};
