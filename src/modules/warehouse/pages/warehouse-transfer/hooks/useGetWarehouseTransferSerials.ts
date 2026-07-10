import { useQuery } from "@tanstack/react-query";
import { warehouseService } from "../../warehouse/api";

interface Params {
  productId?: number | null;
  warehouseId?: number | null;
  isService?: boolean;
  page?: number;
  pageSize?: number;
}

export const useGetWarehouseTransferSerials = (params?: Params) =>
  useQuery({
    queryKey: ["warehouse-transfer", "serials", params ?? null],
    queryFn: () => {
      const queryParams: Record<string, unknown> = {
        productId: params?.productId ?? undefined,
        warehouseId: params?.warehouseId ?? undefined,
        IsService: params?.isService ?? false,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 1000,
      };

      return warehouseService.tables(queryParams);
    },
    enabled: Boolean(params?.productId && params?.warehouseId),
  });
