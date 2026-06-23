import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../api";
import { productKeys } from "../constants/queryKeys";
import type { ProductTypeForm } from "../types/type";

interface UpdateProductArgs {
  id: string | number;
  payload: ProductTypeForm;
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateProductArgs) =>
      productService.update(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      void queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      });
    },
  });
};
