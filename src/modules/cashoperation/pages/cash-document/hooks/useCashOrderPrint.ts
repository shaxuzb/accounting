import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { cashDocumentEndpoints } from "../constants/endpoints";
import { cashDocumentKeys } from "../constants/queryKeys";
import type { CashDocumentKind, CashOrderPrint } from "../types/type";

export const useCashOrderPrint = (kind: CashDocumentKind, id: string) =>
  useQuery({
    queryKey: cashDocumentKeys.print(kind, id),
    queryFn: () =>
      $axiosPrivate
        .get<CashOrderPrint>(cashDocumentEndpoints.print(kind, id))
        .then((res) => res.data),
    enabled: Boolean(id),
  });
