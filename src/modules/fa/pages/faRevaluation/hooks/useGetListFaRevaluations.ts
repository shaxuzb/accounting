import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faRevaluationService } from "../api";

export const useGetListFaRevaluations = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params?.toString?.() ?? params),
    queryFn: () => faRevaluationService.list(params),
    placeholderData: keepPreviousData,
  });
