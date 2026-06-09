import { roleKeys } from "@/modules/settings/constants/queryKeys";
import { RoleModulesData } from "@/modules/settings/types/settings";
import { useQuery } from "@tanstack/react-query";
import { roleService } from "../service/roleService";

export const useGetRoleModules = (organizationId?:number) => {
  return useQuery<RoleModulesData[]>({
    queryKey: [roleKeys.SUBGROUPMODULES,organizationId],
    queryFn: () => roleService.getModules(organizationId),
  });
};


