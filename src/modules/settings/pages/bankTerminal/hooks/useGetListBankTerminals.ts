import { useQuery } from "@tanstack/react-query";
import { bankTerminalService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export const useGetListBankTerminals = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params?.toString()),
    queryFn: () => bankTerminalService.list(params),
  });
