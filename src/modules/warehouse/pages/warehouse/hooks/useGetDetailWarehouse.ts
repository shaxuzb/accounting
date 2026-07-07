import { useQuery } from "@tanstack/react-query";
import { warehouseService } from "../api";
import { queryKeys } from "../constants/queryKeys";

interface Params {
  productGroupId?: number | null;
  search?: string;
  page?: number;
  pageSize?: number;
  warehouseId?: number | null;
}

export const useGetDetailWarehouse = (params?: Params) =>
  useQuery({
    queryKey: queryKeys.products(params),
    queryFn: () => warehouseService.products(params),
    enabled: Boolean(params?.productGroupId),
  });
