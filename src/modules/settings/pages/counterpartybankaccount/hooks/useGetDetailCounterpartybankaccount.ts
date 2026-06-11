import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { counterpartybankaccountService } from "../api";

export const useGetDetailCounterpartybankaccount = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => counterpartybankaccountService.detail(id),
    enabled: Boolean(id),
  });
