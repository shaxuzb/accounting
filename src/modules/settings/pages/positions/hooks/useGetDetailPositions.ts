import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { positionsService } from "../api";

export const useGetDetailPositions = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => positionsService.detail(id),
    enabled: Boolean(id),
  });
