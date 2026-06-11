import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { warehouseService } from "../api";
import { queryKeys } from "../constants/queryKey";
// import type { ListParams } from "@/shared/types";


export const useGetListWarehouses = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params),
    queryFn: () => warehouseService.list(params),
    placeholderData: keepPreviousData,
  });
