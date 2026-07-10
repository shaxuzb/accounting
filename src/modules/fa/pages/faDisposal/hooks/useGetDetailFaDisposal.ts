import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faDisposalService } from "../api";

export const useGetDetailFaDisposal = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => faDisposalService.detail(id),
    enabled: Boolean(id),
  });
