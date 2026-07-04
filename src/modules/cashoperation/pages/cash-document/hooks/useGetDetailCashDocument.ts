import { useQuery } from "@tanstack/react-query";
import { cashDocumentKeys } from "../constants/queryKeys";
import { cashDocumentService } from "../services/cashDocumentService";
import type { CashDocumentKind } from "../types/type";

export const useGetDetailCashDocument = (
  kind: CashDocumentKind,
  id?: string | number,
) =>
  useQuery({
    queryKey: cashDocumentKeys.detail(kind, id ?? ""),
    queryFn: () => cashDocumentService.detail(kind, id ?? ""),
    enabled: Boolean(id),
  });
