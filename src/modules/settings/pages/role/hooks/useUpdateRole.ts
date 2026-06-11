import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RoleForm } from "../types/form";
import { roleService } from "../api";
import { queryKeys } from "../constants/queryKeys";
interface UpdateArgs {
  id: string | number;
  payload: Partial<RoleForm>;
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      roleService.update(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.detail(variables.id),
      });
    },
  });
};
