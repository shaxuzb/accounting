import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { organizationService } from "../api";

export const useGetDetailOrganizations = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => organizationService.detail(id),
    enabled: Boolean(id),
  });
