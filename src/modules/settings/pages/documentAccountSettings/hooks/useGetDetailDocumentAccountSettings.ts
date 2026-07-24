import { useQuery } from "@tanstack/react-query";
import { documentAccountSettingsService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export const useGetDetailDocumentAccountSettings = (
  documentTypeId: string | number,
  enabled = true,
) =>
  useQuery({
    queryKey: queryKeys.detail(documentTypeId),
    queryFn: () => documentAccountSettingsService.detail(documentTypeId),
    enabled: enabled && Boolean(documentTypeId),
  });
