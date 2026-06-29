import { useQuery } from "@tanstack/react-query";
import { warehouseService } from "../api";
import { queryKeys } from "../constants/queryKeys";

interface Params {
  productGroupId?: number | null;
  productId?: number | null;
  page?: number;
  pageSize?: number;
}

export const useGetDetailSerialWarehouse = (params?: Params) =>
  useQuery({
    queryKey: queryKeys.tables(params),
    queryFn: () => warehouseService.tables(params),
    enabled: Boolean(params?.productId),
  });
