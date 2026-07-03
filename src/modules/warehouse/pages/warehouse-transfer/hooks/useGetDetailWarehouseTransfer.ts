import { useQuery } from "@tanstack/react-query";
import { warehouseTransferKeys } from "../constants/queryKeys";
import { warehouseTransferService } from "../services/warehouseTransferService";

export const useGetDetailWarehouseTransfer = (id?: string | number) =>
  useQuery({
    queryKey: warehouseTransferKeys.detail(id ?? ""),
    queryFn: () => warehouseTransferService.detail(id ?? ""),
    enabled: Boolean(id),
  });
