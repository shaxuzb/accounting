import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { counterpartyService } from "../api";

export const useGetDetailCounteryParty = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => counterpartyService.detail(id),
    enabled: Boolean(id),
  });
