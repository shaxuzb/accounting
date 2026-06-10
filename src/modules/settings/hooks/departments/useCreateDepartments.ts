import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { departmentsService } from "../../services/departmentsService";
import type { DepartmentsForm } from "../../types/form";

export const useCreateDepartments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DepartmentsForm) => departmentsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.departments.all });
    },
  });
};
