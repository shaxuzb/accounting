import { useQuery } from "@tanstack/react-query";
import { fiscalCashRegisterService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export const useGetListFiscalCashRegisters = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params?.toString()),
    queryFn: () => fiscalCashRegisterService.list(params),
  });
