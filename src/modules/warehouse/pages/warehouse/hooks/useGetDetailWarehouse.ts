import { useQuery } from "@tanstack/react-query";
import { warehouseService } from "../services/warehouseService";
import { WarehouseKeys } from "../constants/queryKeys";
import type { ListParams } from "@/shared/types";


export const useGetDetailWarehouse = (params?: ListParams | URLSearchParams) =>
  useQuery({
    queryKey: WarehouseKeys.warehouse.detail(params),
    queryFn: () => warehouseService.detail(params ),
    enabled: Boolean(params),
  });
