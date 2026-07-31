import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { openingInventoryService } from "../services/openingInventoryService";
import { queryKeys } from "../constants/queryKeys";
import type { ListParams } from "@/shared/types";

type QueryParams = ListParams | URLSearchParams;

export const useGetOpeningInventories = (params: QueryParams) => {
  const queryParams =
    params instanceof URLSearchParams ? Object.fromEntries(params) : params;

  return useQuery({
    queryKey: queryKeys.lists("opening-inventories", queryParams),
    queryFn: () => openingInventoryService.list(queryParams),
    placeholderData: keepPreviousData,
  });
};
