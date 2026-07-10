import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faDepreciationService } from "../api";

export const useGetListFaDepreciations = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params?.toString?.() ?? params),
    queryFn: () => faDepreciationService.list(params),
    placeholderData: keepPreviousData,
  });
