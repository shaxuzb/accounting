import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { productGroupsService } from "../../services/productGroupsService";
import type { ProductGroupsForm } from "../../types/form";

export const useCreateProductGroups = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductGroupsForm) =>
      productGroupsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.productGroups.all,
      });
    },
  });
};
