import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { organizationUpdate } from "../types/type";
import { queryKeys } from "../constants/queryKeys";
import { organizationService } from "../api";
interface UpdateArgs {
  id: string | number;
  payload: Partial<organizationUpdate>;
}

export const useUpdateOrganizations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      organizationService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.detail(variables.id),
      });
      console.log("sdadas");
      
    },
  });
};
