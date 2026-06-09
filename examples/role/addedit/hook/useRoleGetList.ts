import { roleKeys } from "@/modules/settings/constants/queryKeys";
import { RolesQueryData } from "@/modules/settings/types/settings";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { roleService } from "../service/roleService";

export const useRoleGetList = (organizationId?: number) => {
  const [searchParams] = useSearchParams();
  return useQuery<RolesQueryData>({
    queryKey: [roleKeys.GET_ALL, searchParams.toString(), organizationId],
    queryFn: () => roleService.getList(searchParams, organizationId),
  });
};
