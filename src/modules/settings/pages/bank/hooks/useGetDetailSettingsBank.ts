import { useQuery } from "@tanstack/react-query";
import { settingsBankService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export const useGetDetailSettingsBank = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => settingsBankService.detail(id),
    enabled: Boolean(id),
  });
