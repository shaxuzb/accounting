import { useQuery } from "@tanstack/react-query";
import { warehouseService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export interface Params {
  productGroupId?: number | null;
  productId?: number | null;
  search?: string;
  page?: number;
  pageSize?: number;
  warehouseId?: number | null;
  /** Only the goods below the minimum stock of their card. */
  belowMinimum?: boolean;
}

export const useGetDetailSerialWarehouse = (params?: Params) =>
  useQuery({
    queryKey: queryKeys.tables(params),
    queryFn: () => warehouseService.tables(params),
    enabled: Boolean(params?.productId),
  });
