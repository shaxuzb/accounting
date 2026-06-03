import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "../constants/queryKeys";
import { authService } from "../services/authService";
import type { AuthForm } from "../types/auth";

interface UpdateArgs {
  id: string | number;
  payload: Partial<AuthForm>;
}

export const useUpdateAuth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) => authService.update(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: authKeys.auth.all });
      void queryClient.invalidateQueries({ queryKey: authKeys.auth.detail(variables.id) });
    },
  });
};
