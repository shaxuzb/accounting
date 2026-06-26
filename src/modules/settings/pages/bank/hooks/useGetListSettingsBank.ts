import { useQuery } from "@tanstack/react-query";
import { settingsBankService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export const useGetListSettingsBank = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params?.toString?.() ?? params),
    queryFn: () => settingsBankService.list(params),
  });
