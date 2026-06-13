import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { organizationService } from "../api";

export const useGetListOrganizations = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params?.toString?.() ?? params),
    queryFn: () => organizationService.list(params),
    // placeholderData: keepPreviousData,
  });
