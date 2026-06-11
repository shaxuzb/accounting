import { useQuery } from "@tanstack/react-query";
import { warehouseService } from "../api";
import { queryKeys } from "../constants/queryKey";


export const useGetDetailWarehouses = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => warehouseService.detail(id),
    enabled: Boolean(id),
  });
