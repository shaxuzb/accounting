import { useQuery } from "@tanstack/react-query";
import { inventoryCountKeys } from "../constants/queryKeys";
import { inventoryCountService } from "../services/inventoryCountService";

export const useGetInventoryCountDifferences = (
  id?: string | number,
  enabled = false,
) =>
  useQuery({
    queryKey: inventoryCountKeys.differences(id ?? ""),
    queryFn: () => inventoryCountService.differences(id ?? ""),
    enabled: Boolean(id) && enabled,
  });
