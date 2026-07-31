import { useQuery } from "@tanstack/react-query";
import { openingInventoryService } from "../services/openingInventoryService";
import { queryKeys } from "../constants/queryKeys";

export const useGetOpeningInventoryDetail = (id: string | number | undefined) => {
  return useQuery({
    queryKey: queryKeys.details("opening-inventories", id),
    queryFn: () => openingInventoryService.detail(id!),
    enabled: !!id,
  });
};
