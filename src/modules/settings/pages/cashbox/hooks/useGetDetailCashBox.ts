import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import {  cashBoxService } from "../api";


export const useGetDetailCashBox = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => cashBoxService.detail(id),
    enabled: Boolean(id),
  });
