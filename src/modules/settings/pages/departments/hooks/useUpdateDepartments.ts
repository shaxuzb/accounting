import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { departmentsService } from "../api";
import type { DepartmentsForm } from "../types/form";

interface UpdateArgs {
  id: string | number;
  payload: Partial<DepartmentsForm>;
}

export const useUpdateDepartments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      departmentsService.update(id, payload),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      //  queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
    },
  });
};
