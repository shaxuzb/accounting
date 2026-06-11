import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { usersService } from "../api";
import type { UsersForm } from "../types/form";
import { errorHandlers } from "@/utils/helpers/errorHandlers";

export const useCreateUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UsersForm) => usersService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (err) => {
      errorHandlers(err);
    },
  });
};
