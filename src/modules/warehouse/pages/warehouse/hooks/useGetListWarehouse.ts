import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { warehouseService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export const useGetListWarehouse = (
  params?: URLSearchParams | Record<string, unknown>,
) =>
  useQuery({
    queryKey: queryKeys.groups(
      params instanceof URLSearchParams ? params.toString() : params,
    ),
    queryFn: () => warehouseService.groups(params),
    placeholderData: keepPreviousData,
  });
