import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faDepreciationService } from "../api";

export const useGetDetailFaDepreciation = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => faDepreciationService.detail(id),
    enabled: Boolean(id),
  });
