import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { productGroupsService } from "../api";
import type { ProductGroupsForm } from "../types/form";

export const useCreateProductGroups = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductGroupsForm) =>
      productGroupsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.all,
      });
    },
  });
};
