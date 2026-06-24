import { useQuery } from "@tanstack/react-query";
import { warehouseService } from "../services/warehouseService";
import { WarehouseKeys } from "../constants/queryKeys";
import type { ListParams } from "@/shared/types";


export const useGetDetailSerialWarehouse = (params?: ListParams | URLSearchParams) =>
  useQuery({
    queryKey: WarehouseKeys.warehouse.detailSerial(params),
    queryFn: () => warehouseService.detailSerial(params),
    enabled: Boolean(params),
  });
