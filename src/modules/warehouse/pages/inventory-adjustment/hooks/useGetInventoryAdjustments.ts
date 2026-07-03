import { useQuery } from "@tanstack/react-query";
import type { ListParams } from "@/shared/types";
import { inventoryAdjustmentKeys } from "../constants/queryKeys";
import { inventoryAdjustmentService } from "../services/inventoryAdjustmentService";

export const useGetInventoryAdjustments = (
  params?: ListParams | URLSearchParams,
) =>
  useQuery({
    queryKey: inventoryAdjustmentKeys.list(params),
    queryFn: () => inventoryAdjustmentService.list(params),
  });
