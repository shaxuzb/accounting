import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productsKeys } from "../constants/queryKeys";
import { productsService } from "../services/productsService";
import type { ProductsForm } from "../types/products";

export const useCreateProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductsForm) => productsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productsKeys.products.all });
    },
  });
};
