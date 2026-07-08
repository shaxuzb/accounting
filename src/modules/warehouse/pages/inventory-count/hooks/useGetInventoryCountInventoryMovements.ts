import { useQuery } from "@tanstack/react-query";
import { inventoryCountKeys } from "../constants/queryKeys";
import { inventoryCountService } from "../services/inventoryCountService";

export const useGetInventoryCountInventoryMovements = (
  id?: string | number,
  enabled = false,
) =>
  useQuery({
    queryKey: inventoryCountKeys.inventoryMovements(id ?? ""),
    queryFn: () => inventoryCountService.inventoryMovements(id ?? ""),
    enabled: Boolean(id) && enabled,
  });
