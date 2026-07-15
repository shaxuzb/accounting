import { useQuery } from "@tanstack/react-query";
import { documentAccountSettingsService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export const useGetDetailDocumentAccountSettings = (
  documentTypeId: string | number,
) =>
  useQuery({
    queryKey: queryKeys.detail(documentTypeId),
    queryFn: () => documentAccountSettingsService.detail(documentTypeId),
    enabled: Boolean(documentTypeId),
  });
