import { useQuery } from "@tanstack/react-query";
import { warehouseService } from "../../warehouse/api";

interface Params {
  productId?: number | null;
  // warehouseId?: number | null;
  page?: number;
  pageSize?: number;
}

export const useGetWarehouseTransferSerials = (params?: Params) =>
  useQuery({
    queryKey: ["warehouse-transfer", "serials", params ?? null],
    queryFn: () =>
      warehouseService.tables({
        productId: params?.productId ?? undefined,
        // warehouseId: params?.warehouseId ?? undefined,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 1000,
      }),
    enabled: Boolean(params?.productId),
  });
