import { keepPreviousData, useQuery } from "@tanstack/react-query";
// import type { ListParams } from "@/shared/types";
import { settingsKeys } from "../../constants/queryKeys";
import { positionsService } from "../../services/positionsService";

export const useGetListPositions = (params?:URLSearchParams) =>
  useQuery({
    queryKey: settingsKeys.positions.list(params),
    queryFn: () => positionsService.list(params as any),
    placeholderData: keepPreviousData,
  });
