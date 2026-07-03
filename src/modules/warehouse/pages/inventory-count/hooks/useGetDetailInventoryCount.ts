import { useQuery } from "@tanstack/react-query";
import { inventoryCountKeys } from "../constants/queryKeys";
import { inventoryCountService } from "../services/inventoryCountService";

export const useGetDetailInventoryCount = (id?: string | number) =>
  useQuery({
    queryKey: inventoryCountKeys.detail(id ?? ""),
    queryFn: () => inventoryCountService.detail(id ?? ""),
    enabled: Boolean(id),
  });
