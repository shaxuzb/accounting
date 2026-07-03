import { useQuery } from "@tanstack/react-query";
import { inventoryAdjustmentKeys } from "../constants/queryKeys";
import { inventoryAdjustmentService } from "../services/inventoryAdjustmentService";

export const useGetDetailInventoryAdjustment = (id?: string | number) =>
  useQuery({
    queryKey: inventoryAdjustmentKeys.detail(id ?? ""),
    queryFn: () => inventoryAdjustmentService.detail(id ?? ""),
    enabled: Boolean(id),
  });
