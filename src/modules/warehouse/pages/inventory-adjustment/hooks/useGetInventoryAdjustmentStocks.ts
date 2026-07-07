import { useQuery } from "@tanstack/react-query";
import { warehouseService } from "../../warehouse/api";

interface Params {
  warehouseId?: number | null;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const useGetInventoryAdjustmentStocks = (params?: Params) =>
  useQuery({
    queryKey: ["inventory-adjustment", "stocks", params ?? null],
    queryFn: () =>
      warehouseService.products({
        warehouseId: params?.warehouseId ?? undefined,
        search: params?.search,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 1000,
      }),
    enabled: Boolean(params?.warehouseId),
  });
