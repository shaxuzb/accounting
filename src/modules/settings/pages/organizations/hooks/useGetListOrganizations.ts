import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { organizationService } from "../api";

export const useGetListOrganizations = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params),
    queryFn: () => organizationService.list(params),
    // placeholderData: keepPreviousData,
  });
