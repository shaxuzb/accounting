import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateProductAccounts } from "@/shared/productAccounts";
import { productService } from "../api";
import { productKeys } from "../constants/queryKeys";
import type { ProductTypeForm } from "../types/type";
import { toCreatePayload } from "../types/form";

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductTypeForm) =>
      productService.create(toCreatePayload(payload)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      // a new kind can bring its accounts into the chart
      invalidateProductAccounts(queryClient);
    },
  });
};
