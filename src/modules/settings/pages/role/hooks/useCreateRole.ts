import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "../api";
import type { RoleForm } from "../types/form";
import { queryKeys } from "../constants/queryKeys";

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RoleForm) => roleService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
