import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { roleService } from "../api";

export const useGetRoleModules = (organizationId?: string | number) =>
  useQuery({
    queryKey: queryKeys.modules(organizationId),
    queryFn: () => roleService.modules(organizationId),
    // enabled: Boolean(organizationId),
    // staleTime: 10 * 60 * 1000,
  });
