import { useQuery } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { positionsService } from "../../services/positionsService";

export const useGetDetailPositions = (id: string | number) =>
  useQuery({
    queryKey: settingsKeys.positions.detail(id),
    queryFn: () => positionsService.detail(id),
    enabled: Boolean(id),
  });
