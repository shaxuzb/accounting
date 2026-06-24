import { useQuery } from "@tanstack/react-query";
import { bankQueryKeys } from "../constants/queryKeys";
import { bankStatementParserService } from "../services/bankStatementParserService";

export const useGetBankOperations = (params?: URLSearchParams) =>
  useQuery({
    queryKey: bankQueryKeys.operations.list(params?.toString?.() ?? params),
    queryFn: () => bankStatementParserService.listOperations(params),
  });
