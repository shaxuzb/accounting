import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../constants/queryKeys";
import { usersService } from "../services/usersService";
import type { UsersForm } from "../types/settings";

export const useCreateUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UsersForm) => usersService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.users.all });
    },
  });
};
