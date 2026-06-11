import { keepPreviousData, useQuery } from "@tanstack/react-query";
// import type { ListParams } from "@/shared/types";
import { queryKeys } from "../constants/queryKeys";
import { productGroupsService } from "../api";

export const useGetListProductGroups = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params),
    queryFn: () => productGroupsService.list(params),
    placeholderData: keepPreviousData,
  });
