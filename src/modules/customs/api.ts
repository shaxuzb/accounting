import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { getJson } from "@/modules/accountings/services/request";
import type { ExtraCostEffect, ExtraCostPurchase } from "@/modules/extraCosts/api";

export interface CustomsLine {
  id?: number;
  purchaseLineId: number;
  productId: number;
  productName?: string | null;
  quantity: number;
  customsValue: number;
  dutyRate: number;
  dutyAmount: number;
  exciseAmount: number;
  feeAmount: number;
  vatRateId?: number | null;
  vatAmount: number;
}

export interface CustomsListItem {
  id: number;
  docNumber: string;
  docDate: string;
  purchaseDocId: number;
  purchaseDocNumber?: string | null;
  declarationNumber?: string | null;
  dutyAmount: number;
  exciseAmount: number;
  customsFee: number;
  vatAmount: number;
  finalAmount: number;
  statusId: number;
}

export interface CustomsDocument {
  id: number;
  docNumber: string;
  docDate: string;
  purchaseDocId: number;
  purchaseDocNumber?: string | null;
  counterpartyId?: number | null;
  declarationNumber?: string | null;
  customsFee: number;
  dutyAmount: number;
  exciseAmount: number;
  vatAmount: number;
  finalAmount: number;
  settlementAccountId?: number | null;
  vatAccountId?: number | null;
  costAccountId?: number | null;
  comment?: string | null;
  statusId: number;
  lines: CustomsLine[];
  effects: ExtraCostEffect[];
}

export interface CustomsBase {
  purchaseDocId: number;
  docNumber: string;
  docDate: string;
  counterpartyName?: string | null;
  currencyId: number;
  exchangeRate: number;
  lines: CustomsLine[];
}

export interface CustomsDefaults {
  settlementAccountId?: number | null;
  vatAccountId?: number | null;
  costAccountId?: number | null;
  vatPayer: boolean;
  vatRates: { id: number; name: string; rate: number }[];
}

export interface CustomsSave {
  docDate: string;
  purchaseDocId: number;
  counterpartyId?: number | null;
  declarationNumber?: string | null;
  customsFee: number;
  settlementAccountId?: number | null;
  vatAccountId?: number | null;
  costAccountId?: number | null;
  comment?: string | null;
  lines: {
    purchaseLineId: number;
    customsValue: number;
    dutyRate: number;
    dutyAmount: number;
    exciseAmount: number;
    vatRateId?: number | null;
    vatAmount: number;
  }[];
}

const base = "/customs-declarations";

export const useCustomsDeclarations = (params: { dateFrom?: string; dateTo?: string; search?: string }) =>
  useQuery({
    queryKey: ["customs-declarations", params],
    queryFn: () => getJson<CustomsListItem[]>(base, params),
  });

export const useCustomsDeclaration = (id: number | null) =>
  useQuery({
    queryKey: ["customs-declarations", "detail", id],
    queryFn: () => getJson<CustomsDocument>(`${base}/${id}`),
    enabled: Boolean(id),
  });

/** The posted purchases a declaration can be made on (the same list additional costs use). */
export const useCustomsPurchases = (search: string, enabled: boolean) =>
  useQuery({
    queryKey: ["customs-declarations", "purchases", search],
    queryFn: () => getJson<ExtraCostPurchase[]>("/purchase-extra-costs/purchases", { search }),
    enabled,
  });

export const useCustomsBase = (purchaseId: number | null) =>
  useQuery({
    queryKey: ["customs-declarations", "base", purchaseId],
    queryFn: () => getJson<CustomsBase>(`${base}/base/${purchaseId}`),
    enabled: Boolean(purchaseId),
  });

export const useCustomsDefaults = (date: string) =>
  useQuery({
    queryKey: ["customs-declarations", "defaults", date],
    queryFn: () => getJson<CustomsDefaults>(`${base}/defaults`, { date }),
  });

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["customs-declarations"] });
};

export const useSaveCustomsDeclaration = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number | null; body: CustomsSave }) => {
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

export const useConfirmCustomsDeclaration = () => useAction((id) => $axiosPrivate.put(`${base}/${id}/confirm`));
export const useCancelCustomsDeclaration = () => useAction((id) => $axiosPrivate.put(`${base}/${id}/cancel`));
export const useDeleteCustomsDeclaration = () => useAction((id) => $axiosPrivate.delete(`${base}/${id}`));
