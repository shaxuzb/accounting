import { useQuery } from "@tanstack/react-query";
import { fiscalCashRegisterService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export const useGetDetailFiscalCashRegister = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => fiscalCashRegisterService.detail(id),
    enabled: Boolean(id),
  });
