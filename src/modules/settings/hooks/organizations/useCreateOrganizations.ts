import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationService } from "../../services/organizationsService";
import type { organizationCreate } from "../../types/settings";
import { settingsKeys } from "../../constants/queryKeys";

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: organizationCreate) => organizationService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.organizations.all });
    },
  });
};
