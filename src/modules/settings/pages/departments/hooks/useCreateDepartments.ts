import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { departmentsService } from "../api";
import type { DepartmentsForm } from "../types/form";

export const useCreateDepartments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DepartmentsForm) =>
      departmentsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
