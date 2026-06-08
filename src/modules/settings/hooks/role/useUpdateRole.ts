import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RoleForm } from "../../types/settings";
import { roleService } from "../../services/roleService";
import { settingsKeys } from "../../constants/queryKeys";
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
      void queryClient.invalidateQueries({ queryKey: settingsKeys.role.all });
      void queryClient.invalidateQueries({
        queryKey: settingsKeys.role.detail(variables.id),
      });
    },
  });
};
