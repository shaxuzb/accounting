import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../api";
import { productKeys } from "../constants/queryKeys";
import type { ProductTypeForm } from "../types/type";
import { toUpdatePayload } from "../types/form";

interface UpdateProductArgs {
  id: string | number;
  payload: ProductTypeForm;
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateProductArgs) =>
      productService.update(id, toUpdatePayload(payload)),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      });
    },
  });
};
