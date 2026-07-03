import { useQuery } from "@tanstack/react-query";
import type { ListParams } from "@/shared/types";
import { warehouseTransferKeys } from "../constants/queryKeys";
import { warehouseTransferService } from "../services/warehouseTransferService";

export const useGetWarehouseTransfers = (params?: ListParams | URLSearchParams) =>
  useQuery({
    queryKey: warehouseTransferKeys.list(params),
    queryFn: () => warehouseTransferService.list(params),
  });
