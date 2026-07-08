import { useQuery } from "@tanstack/react-query";
import { inventoryCountKeys } from "../constants/queryKeys";
import { inventoryCountService } from "../services/inventoryCountService";

export const useGetInventoryCountPostingBatches = (
  id?: string | number,
  enabled = false,
) =>
  useQuery({
    queryKey: inventoryCountKeys.postingBatches(id ?? ""),
    queryFn: () => inventoryCountService.postingBatches(id ?? ""),
    enabled: Boolean(id) && enabled,
  });
