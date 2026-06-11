import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationService } from "../api";
import type { organizationCreate } from "../types/type";
import { queryKeys } from "../constants/queryKeys";

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: organizationCreate) => organizationService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
