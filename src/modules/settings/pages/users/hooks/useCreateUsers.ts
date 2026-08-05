import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { usersService } from "../api";
import type { CreateUserPayload } from "../types/form";
import { errorHandlers } from "@/utils/helpers/errorHandlers";

export const useCreateUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (err) => {
      errorHandlers(err);
    },
  });
};
