import { roleKeys } from "@/modules/settings/constants/queryKeys";
import { RoleGetByIdData } from "@/modules/settings/types/settings";
import { useQuery } from "@tanstack/react-query";
import { roleService } from "../service/roleService";

export const useGetRoleId = (roleId: number) => {
  return useQuery<RoleGetByIdData>({
    queryKey: [roleKeys.GET_DETAIL, roleId],
    queryFn: () => roleService.getDetail(roleId),
    enabled: !!roleId,
  });
};


