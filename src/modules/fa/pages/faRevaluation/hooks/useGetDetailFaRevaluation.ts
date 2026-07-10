import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faRevaluationService } from "../api";

export const useGetDetailFaRevaluation = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => faRevaluationService.detail(id),
    enabled: Boolean(id),
  });
