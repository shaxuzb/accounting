import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faMovementService } from "../api";

export const useGetListFaMovements = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params?.toString?.() ?? params),
    queryFn: () => faMovementService.list(params),
    placeholderData: keepPreviousData,
  });
