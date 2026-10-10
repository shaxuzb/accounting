import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateProductAccounts } from "@/shared/productAccounts";
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
      // a changed kind changes the accounts new document lines take
      invalidateProductAccounts(queryClient);
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      });
    },
  });
};
