import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { usersService } from "../../services/usersService";
import type { UsersForm } from "../../types/form";

export const useCreateUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UsersForm) => usersService.create(payload),
    onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: settingsKeys.users.all });
    },
  });
};
