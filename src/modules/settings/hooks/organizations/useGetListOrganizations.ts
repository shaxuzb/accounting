import { useQuery } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { organizationService } from "../../services/organizationsService";

export const useGetListOrganizations = (params?: URLSearchParams) =>
  useQuery({
    queryKey: settingsKeys.organizations.list(params),
    queryFn: () => organizationService.list(params),
    // placeholderData: keepPreviousData,
  });
