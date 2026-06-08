import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "../../services/roleService";
import type { RoleForm } from "../../types/settings";
import { settingsKeys } from "../../constants/queryKeys";

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RoleForm) => roleService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.role.all });
    },
  });
};
