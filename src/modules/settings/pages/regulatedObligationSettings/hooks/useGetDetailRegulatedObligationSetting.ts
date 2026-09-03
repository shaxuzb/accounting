import { useQuery } from "@tanstack/react-query";
import { regulatedObligationSettingsService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export const useGetDetailRegulatedObligationSetting = (
  id: string | number | null,
) =>
  useQuery({
    queryKey: queryKeys.detail(id ?? ""),
    queryFn: () => regulatedObligationSettingsService.detail(id ?? ""),
    enabled: id !== null && id !== undefined,
  });
