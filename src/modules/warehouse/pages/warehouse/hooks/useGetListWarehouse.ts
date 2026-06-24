import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ListParams } from "@/shared/types";
import { WarehouseKeys } from "../constants/queryKeys";
import { warehouseService } from "../services/warehouseService";


export const useGetListWarehouse = (params?: ListParams | URLSearchParams) =>
  useQuery({
    queryKey: WarehouseKeys.warehouse.list(params),
    queryFn: () => warehouseService.list(params),
    placeholderData: keepPreviousData,
  });
