import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { UsersForm } from "../types/form";

interface UpdateArgs {
  id: string | number;
  payload: Partial<UsersForm>;
}

export const useUpdateUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      usersService.update(id, payload),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      // queryClient.invalidateQueries({
      //   queryKey: queryKeys.detail(variables.id),
      // });
    },
    // onError: (err) => {
    //   errorHandlers(err);
    // },
  });
};
