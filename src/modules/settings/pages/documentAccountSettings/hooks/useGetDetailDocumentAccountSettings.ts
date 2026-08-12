import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import { documentAccountSettingsService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export const useGetDetailDocumentAccountSettings = (
  documentTypeId: string | number,
  enabled = true,
) => {
  const organizationId = useAppSelector((state) => state.organization.id || null);

  return useQuery({
    queryKey: queryKeys.detail(documentTypeId, organizationId),
    queryFn: () => documentAccountSettingsService.detail(documentTypeId),
    enabled: enabled && Boolean(documentTypeId) && Boolean(organizationId),
  });
};
