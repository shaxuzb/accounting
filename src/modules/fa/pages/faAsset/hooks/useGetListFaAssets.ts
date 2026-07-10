import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faAssetService } from "../api";

export const useGetListFaAssets = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params?.toString?.() ?? params),
    queryFn: () => faAssetService.list(params),
    placeholderData: keepPreviousData,
  });
