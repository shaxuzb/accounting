import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { regulatedObligationSettingsService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { RegulatedObligationSettingsQuery } from "../api/query";

export const useGetListRegulatedObligationSettings = (
  filters?: RegulatedObligationSettingsQuery,
) =>
  useQuery({
    queryKey: queryKeys.list(filters),
    queryFn: () => regulatedObligationSettingsService.list(filters),
    placeholderData: keepPreviousData,
  });
