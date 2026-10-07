import { useQuery } from "@tanstack/react-query";
import { warehouseService } from "../../warehouse/api";

interface Params {
  warehouseId?: number | null;
  /** The document's date and time: the stock is the balance at that moment. */
  onDate?: string | null;
  search?: string;
  isService?: boolean;
  page?: number;
  pageSize?: number;
}

export const useGetWarehouseTransferStocks = (params?: Params) =>
  useQuery({
    queryKey: ["warehouse-transfer", "stocks", params ?? null],
    queryFn: () => {
      const queryParams: Record<string, unknown> = {
        warehouseId: params?.warehouseId ?? undefined,
        onDate: params?.onDate || undefined,
        search: params?.search,
        IsService: params?.isService ?? false,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 1000,
      };

      return warehouseService.products(queryParams);
    },
    enabled: Boolean(params?.warehouseId),
  });
