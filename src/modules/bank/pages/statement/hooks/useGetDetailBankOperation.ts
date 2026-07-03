import { useQuery } from "@tanstack/react-query";
import { bankQueryKeys } from "../constants/queryKeys";
import { bankStatementParserService } from "../services/bankStatementParserService";

export const useGetDetailBankOperation = (id?: string | number) =>
  useQuery({
    queryKey: bankQueryKeys.operations.detail(id ?? ""),
    queryFn: () => bankStatementParserService.detailOperation(id ?? ""),
    enabled: Boolean(id),
  });
