import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { departmentsService } from "../../services/departmentsService";
import type { DepartmentsForm } from "../../types/form";

interface UpdateArgs {
  id: string | number;
  payload: Partial<DepartmentsForm>;
}

export const useUpdateDepartments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) => departmentsService.update(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.departments.all });
      void queryClient.invalidateQueries({ queryKey: settingsKeys.departments.detail(variables.id) });
    },
  });
};
