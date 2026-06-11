import { keepPreviousData, useQuery } from "@tanstack/react-query";
// import type { ListParams } from "@/shared/types";
import { queryKeys } from "../constants/queryKeys";
import { cashBoxService } from "../api";


export const useGetListCashBox = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params),
    queryFn: () => cashBoxService.list(params),
    placeholderData: keepPreviousData,
  });
