import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../constants/queryKeys";
import { usersService } from "../services/usersService";
import type { UsersForm } from "../types/settings";

interface UpdateArgs {
  id: string | number;
  payload: Partial<UsersForm>;
}

export const useUpdateUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) => usersService.update(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.users.all });
      void queryClient.invalidateQueries({ queryKey: settingsKeys.users.detail(variables.id) });
    },
  });
};
