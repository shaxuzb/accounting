import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { organizationUpdate } from "../../types/settings";
import { settingsKeys } from "../../constants/queryKeys";
import { organizationService } from "../../services/organizationsService";
interface UpdateArgs {
  id: string | number;
  payload: Partial<organizationUpdate>;
}

export const useUpdateOrganizations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      organizationService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.organizations.all,
      });
      queryClient.invalidateQueries({
        queryKey: settingsKeys.organizations.detail(variables.id),
      });
      console.log("sdadas");
      
    },
  });
};
