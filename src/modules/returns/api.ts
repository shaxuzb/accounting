import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { getJson } from "@/modules/accountings/services/request";
import type { ReturnKind } from "./constants";

export interface ReturnLine {
  id?: number;
  baseLineId: number;
  productId: number;
  productName?: string | null;
  unitId: number;
  quantity: number;
  returnableQuantity: number;
  unitPrice: number;
  amount: number;
  vatRateId?: number | null;
  vatAmount: number;
  totalAmount: number;
  costAmount?: number;
  /** Goods kept by marking code: they come back by code. */
  isPieceTracked?: boolean;
  /** The units chosen to come back. */
  productTableIds?: number[];
  /** The units that may come back. */
  units?: ReturnUnit[];
}

export interface ReturnUnit {
  productTableId: number;
  markingNumber?: string | null;
  serialNumber?: string | null;
}

export interface ReturnListItem {
  id: number;
  kind: ReturnKind;
  docNumber: string;
  docDate: string;
  baseDocumentId: number;
  baseDocNumber?: string | null;
  counterpartyName?: string | null;
  warehouseName?: string | null;
  finalAmount: number;
  statusId: number;
  comment?: string | null;
}

export interface ReturnDocument {
  id: number;
  kind: ReturnKind;
  documentTypeId: number;
  docNumber: string;
  docDate: string;
  baseDocumentId: number;
  baseDocNumber?: string | null;
  baseDocDate?: string | null;
  counterpartyName?: string | null;
  warehouseName?: string | null;
  currencyId: number;
  amount: number;
  vatAmount: number;
  finalAmount: number;
  comment?: string | null;
  statusId: number;
  lines: ReturnLine[];
}

export interface ReturnBaseDocument {
  id: number;
  docNumber: string;
  docDate: string;
  counterpartyName?: string | null;
  warehouseName?: string | null;
  currencyId: number;
  finalAmount: number;
  lines: ReturnLine[];
}

export interface ReturnSave {
  kind: ReturnKind;
  baseDocumentId: number;
  docDate: string;
  comment?: string | null;
  lines: { baseLineId: number; quantity: number; productTableIds?: number[] }[];
}

const base = "/return-docs";

export const useReturns = (params: {
  kind: ReturnKind;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}) =>
  useQuery({
    queryKey: ["return-docs", params],
    queryFn: () => getJson<ReturnListItem[]>(base, params),
  });

export const useReturn = (id: number | null) =>
  useQuery({
    queryKey: ["return-docs", "detail", id],
    queryFn: () => getJson<ReturnDocument>(`${base}/${id}`),
    enabled: Boolean(id),
  });

export const useReturnBaseDocuments = (kind: ReturnKind, search: string) =>
  useQuery({
    queryKey: ["return-docs", "base-documents", kind, search],
    queryFn: () => getJson<ReturnBaseDocument[]>(`${base}/base-documents`, { kind, search }),
  });

export const useReturnBaseDocument = (kind: ReturnKind, baseDocumentId: number | null) =>
  useQuery({
    queryKey: ["return-docs", "base-document", kind, baseDocumentId],
    queryFn: () => getJson<ReturnBaseDocument>(`${base}/base-documents/${baseDocumentId}`, { kind }),
    enabled: Boolean(baseDocumentId),
  });

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["return-docs"] });
};

export const useSaveReturn = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number | null; body: ReturnSave }) => {
      if (id) {
        await $axiosPrivate.put(`${base}/${id}`, body);
        return id;
      }
      const { data } = await $axiosPrivate.post<number>(base, body);
      return data;
    },
    onSuccess: invalidate,
  });
};

const useAction = (action: (id: number) => Promise<unknown>) => {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: action, onSuccess: invalidate });
};

export const useConfirmReturn = () => useAction((id) => $axiosPrivate.put(`${base}/${id}/confirm`));
export const useCancelReturn = () => useAction((id) => $axiosPrivate.put(`${base}/${id}/cancel`));
export const useDeleteReturn = () => useAction((id) => $axiosPrivate.delete(`${base}/${id}`));
