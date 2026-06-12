import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../api";
import { productKeys } from "../constants/queryKeys";
import type { ProductTypeForm } from "../types/type";

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductTypeForm) => productService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};
