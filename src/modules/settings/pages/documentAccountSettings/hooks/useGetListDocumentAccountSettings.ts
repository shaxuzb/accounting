import { useQuery } from "@tanstack/react-query";
import { documentAccountSettingsService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export const useGetListDocumentAccountSettings = () =>
  useQuery({
    queryKey: queryKeys.list,
    queryFn: () => documentAccountSettingsService.list(),
  });
