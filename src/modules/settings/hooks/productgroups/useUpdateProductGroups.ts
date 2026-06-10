import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { productGroupsService } from "../../services/productGroupsService";
import type { ProductGroupsForm } from "../../types/form";

interface UpdateArgs {
  id: string | number;
  payload: Partial<ProductGroupsForm>;
}

export const useUpdateProductGroups = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      productGroupsService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.productGroups.all,
      });
      queryClient.invalidateQueries({
        queryKey: settingsKeys.productGroups.detail(variables.id),
      });
    },
  });
};
