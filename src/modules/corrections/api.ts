import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { getJson } from "@/modules/accountings/services/request";
import { corrections, type CorrectionKind } from "./constants";

export interface CorrectionListItem {
  id: number;
  kind: number;
  docNumber: string;
  docDate: string;
  baseDocumentId: number;
  baseDocNumber?: string | null;
  counterpartyName?: string | null;
  reason: number;
  amountDelta: number;
  vatDelta: number;
  totalDelta: number;
  comment?: string | null;
  statusId: number;
}

export interface CorrectionLine {
  id?: number | null;
  baseLineId: number;
  productId: number;
  productName?: string | null;
  isService: boolean;
  quantity: number;
  vatRateId?: number | null;
  vatRateName?: string | null;
  oldUnitPrice: number;
  newUnitPrice: number;
  oldAmount: number;
  newAmount: number;
  oldVatAmount: number;
  newVatAmount: number;
  amountDelta: number;
  vatDelta: number;
}

export interface CorrectionEffect {
  batchId: number;
  productId: number;
  productName?: string | null;
  kind: number;
  quantity: number;
  amount: number;
  unitCostAdded: number;
}

export interface CorrectionDocument {
  id?: number | null;
  kind: number;
  docNumber?: string | null;
  docDate: string;
  baseDocumentId: number;
  baseDocNumber?: string | null;
  baseDocDate?: string | null;
  counterpartyName?: string | null;
  priceIncludesVat: boolean;
  reason: number;
  amountDelta: number;
  vatDelta: number;
  totalDelta: number;
  comment?: string | null;
  statusId: number;
  lines: CorrectionLine[];
  effects: CorrectionEffect[];
}

export interface CorrectionSave {
  kind: number;
  docDate: string;
  baseDocumentId: number;
  reason: number;
  comment?: string | null;
  lines: { baseLineId: number; newUnitPrice: number }[];
}

export interface CorrectionBase {
  id: number;
  docNumber: string;
  docDate: string;
  counterpartyName?: string | null;
  finalAmount: number;
}

const base = "/corrections";
const key = (kind: CorrectionKind) => ["corrections", kind];

export const useCorrections = (kind: CorrectionKind, params: { dateFrom?: string; dateTo?: string; search?: string }) =>
  useQuery({
    queryKey: [...key(kind), params],
    queryFn: () => getJson<CorrectionListItem[]>(base, { ...params, kind: corrections[kind].kind }),
  });

export const useCorrection = (kind: CorrectionKind, id: number | null) =>
  useQuery({
    queryKey: [...key(kind), "detail", id],
    queryFn: () => getJson<CorrectionDocument>(`${base}/${id}`),
    enabled: Boolean(id),
  });

export const useCorrectionBases = (kind: CorrectionKind, search: string, enabled: boolean) =>
  useQuery({
    queryKey: [...key(kind), "bases", search],
    queryFn: () => getJson<CorrectionBase[]>(`${base}/bases`, { kind: corrections[kind].kind, search }),
    enabled,
  });

/** The base's lines with the new prices and the differences, recomputed by the server. */
export const useCorrectionPreview = (kind: CorrectionKind, body: CorrectionSave | null) =>
  useQuery({
    queryKey: [...key(kind), "preview", body],
    queryFn: async () => (await $axiosPrivate.post<CorrectionDocument>(`${base}/preview`, body)).data,
    enabled: Boolean(body),
    retry: false,
  });

export const useSaveCorrection = (kind: CorrectionKind) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number | null; body: CorrectionSave }) => {
      if (id) {
        await $axiosPrivate.put(`${base}/${id}`, body);
        return id;
      }
      const { data } = await $axiosPrivate.post<number>(base, body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key(kind) }),
  });
};

export const useCorrectionAction = (kind: CorrectionKind, action: "confirm" | "cancel" | "delete") => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      action === "delete" ? $axiosPrivate.delete(`${base}/${id}`) : $axiosPrivate.post(`${base}/${id}/${action}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key(kind) }),
  });
};
