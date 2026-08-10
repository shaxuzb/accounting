import { useQuery } from "@tanstack/react-query";
import { bankTerminalService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export const useGetDetailBankTerminal = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => bankTerminalService.detail(id),
    enabled: Boolean(id),
  });
