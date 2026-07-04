import { useQuery } from "@tanstack/react-query";
import type { QueryParams } from "@/shared/types/api";
import { cashDocumentKeys } from "../constants/queryKeys";
import { cashDocumentService } from "../services/cashDocumentService";
import type { CashDocumentKind } from "../types/type";

export const useGetCashDocuments = (
  kind: CashDocumentKind,
  params?: QueryParams,
) =>
  useQuery({
    queryKey: cashDocumentKeys.list(kind, params),
    queryFn: () => cashDocumentService.list(kind, params),
  });
