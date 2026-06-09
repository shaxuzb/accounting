import { useQuery } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { organizationService } from "../../services/organizationsService";

export const useGetDetailOrganizations = (id: string | number) =>
  useQuery({
    queryKey: settingsKeys.organizations.detail(id),
    queryFn: () => organizationService.detail(id),
    enabled: Boolean(id),
  });
