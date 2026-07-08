import { useQuery } from "@tanstack/react-query";
import { inventoryCountKeys } from "../constants/queryKeys";
import { inventoryCountService } from "../services/inventoryCountService";
import type { InventoryCountListFilter } from "../types/type";

export const useGetInventoryCounts = (
  params?: InventoryCountListFilter | URLSearchParams,
) =>
  useQuery({
    queryKey: inventoryCountKeys.list(params),
    queryFn: () => inventoryCountService.list(params),
  });
