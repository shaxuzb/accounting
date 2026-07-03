import { useQuery } from "@tanstack/react-query";
import type { ListParams } from "@/shared/types";
import { inventoryCountKeys } from "../constants/queryKeys";
import { inventoryCountService } from "../services/inventoryCountService";

export const useGetInventoryCounts = (params?: ListParams | URLSearchParams) =>
  useQuery({
    queryKey: inventoryCountKeys.list(params),
    queryFn: () => inventoryCountService.list(params),
  });
