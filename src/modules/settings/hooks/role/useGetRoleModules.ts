import { useQuery } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { roleService } from "../../services/roleService";

export const useGetRoleModules = (organizationId?: string | number) =>
  useQuery({
    queryKey: settingsKeys.role.modules(organizationId),
    queryFn: () => roleService.modules(organizationId),
    // enabled: Boolean(organizationId),
    // staleTime: 10 * 60 * 1000,
  });
