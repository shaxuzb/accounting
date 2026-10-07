import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { getJson } from "@/modules/accountings/services/request";

export interface ExtraCostLine {
  id?: number;
  purchaseLineId: number;
  productId: number;
  productName?: string | null;
  quantity: number;
  baseAmount: number;
  amount: number;
}

export interface ExtraCostEffect {
  batchId: number;
  batchNumber?: string | null;
  warehouseId: number;
  warehouseName?: string | null;
  productId: number;
  productName?: string | null;
  kind: number;
  quantity: number;
  amount: number;
  unitCostAdded: number;
}

export interface ExtraCostListItem {
  id: number;
  docNumber: string;
  docDate: string;
  purchaseDocId: number;
  purchaseDocNumber?: string | null;
  counterpartyId: number;
  counterpartyName?: string | null;
  content?: string | null;
  amount: number;
  vatAmount: number;
  finalAmount: number;
  statusId: number;
}

export interface ExtraCostDocument {
  id: number;
  docNumber: string;
  docDate: string;
  purchaseDocId: number;
  purchaseDocNumber?: string | null;
  purchaseDocDate?: string | null;
  counterpartyId: number;
  counterpartyName?: string | null;
  contractId?: number | null;
  content?: string | null;
  distributionMethod: number;
  amount: number;
  vatRateId?: number | null;
  vatAmount: number;
  finalAmount: number;
  supplierAccountId?: number | null;
  vatAccountId?: number | null;
  costAccountId?: number | null;
  comment?: string | null;
  statusId: number;
  lines: ExtraCostLine[];
  effects: ExtraCostEffect[];
}

export interface ExtraCostPurchase {
  id: number;
  docNumber: string;
  docDate: string;
  counterpartyId: number;
  counterpartyName?: string | null;
  contractId?: number | null;
  warehouseName?: string | null;
  finalAmount: number;
}

export interface ExtraCostDefaults {
  supplierAccountId?: number | null;
  vatAccountId?: number | null;
  costAccountId?: number | null;
  vatPayer: boolean;
  vatRates: { id: number; name: string; rate: number }[];
}

export interface ExtraCostSave {
  docDate: string;
  purchaseDocId: number;
  counterpartyId: number;
  contractId?: number | null;
  content?: string | null;
  distributionMethod: number;
  amount: number;
  vatRateId?: number | null;
  vatAmount?: number | null;
  supplierAccountId?: number | null;
  vatAccountId?: number | null;
  costAccountId?: number | null;
  comment?: string | null;
}

const base = "/purchase-extra-costs";

export const useExtraCosts = (params: { dateFrom?: string; dateTo?: string; search?: string; purchaseDocId?: number }) =>
  useQuery({
    queryKey: ["purchase-extra-costs", params],
    queryFn: () => getJson<ExtraCostListItem[]>(base, params),
  });

export const useExtraCost = (id: number | null) =>
  useQuery({
    queryKey: ["purchase-extra-costs", "detail", id],
    queryFn: () => getJson<ExtraCostDocument>(`${base}/${id}`),
    enabled: Boolean(id),
  });

export const useExtraCostPurchases = (search: string, enabled: boolean) =>
  useQuery({
    queryKey: ["purchase-extra-costs", "purchases", search],
    queryFn: () => getJson<ExtraCostPurchase[]>(`${base}/purchases`, { search }),
    enabled,
  });

export const useExtraCostDefaults = (date: string, enabled: boolean) =>
  useQuery({
    queryKey: ["purchase-extra-costs", "defaults", date],
    queryFn: () => getJson<ExtraCostDefaults>(`${base}/defaults`, { date }),
    enabled,
  });

/** How the costs fall on the purchase's goods, recomputed by the server as the user types. */
export const useExtraCostPreview = (body: ExtraCostSave | null) =>
  useQuery({
    queryKey: ["purchase-extra-costs", "preview", body],
    queryFn: async () => (await $axiosPrivate.post<ExtraCostLine[]>(`${base}/preview`, body)).data,
    enabled: Boolean(body),
    retry: false,
  });

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["purchase-extra-costs"] });
};

export const useSaveExtraCost = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number | null; body: ExtraCostSave }) => {
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

export const useConfirmExtraCost = () => useAction((id) => $axiosPrivate.put(`${base}/${id}/confirm`));
export const useCancelExtraCost = () => useAction((id) => $axiosPrivate.put(`${base}/${id}/cancel`));
export const useDeleteExtraCost = () => useAction((id) => $axiosPrivate.delete(`${base}/${id}`));
