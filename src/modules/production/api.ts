import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { getJson } from "@/modules/accountings/services/request";
import { productionDocs, type ProductionDocKind } from "./constants";

export interface ProductionDocListItem {
  id: number;
  docNumber: string;
  docDate: string;
  warehouseId: number;
  warehouseName?: string | null;
  costAccountId?: number | null;
  costAccountNumber?: string | null;
  productGroupName?: string | null;
  amount: number;
  lineCount: number;
  comment?: string | null;
  statusId: number;
}

export interface ProductionDocLine {
  id?: number;
  productId: number;
  productName?: string | null;
  unitId?: number;
  unitName?: string | null;
  quantity: number;
  unitCost?: number | null;
  amount?: number;
  inventoryAccountId?: number | null;
  inventoryAccountNumber?: string | null;
  comment?: string | null;
}

export interface ProductionDocument {
  id: number;
  docNumber: string;
  docDate: string;
  warehouseId: number;
  warehouseName?: string | null;
  costAccountId?: number | null;
  costAccountNumber?: string | null;
  productGroupId?: number | null;
  productGroupName?: string | null;
  costItemId?: number | null;
  costItemName?: string | null;
  comment?: string | null;
  statusId: number;
  amount: number;
  lines: ProductionDocLine[];
}

export interface ProductionDocSave {
  docDate: string;
  warehouseId: number;
  costAccountId?: number | null;
  productGroupId?: number | null;
  costItemId?: number | null;
  comment?: string | null;
  lines: { productId: number; unitId: number; quantity: number; unitCost?: number | null; comment?: string | null }[];
}

export interface ProductionDefaults {
  costAccountId?: number | null;
  costAccountNumber?: string | null;
  costAccountPrefixes: string[];
  costAccounts: { id: number; number: string; name: string }[];
}

const key = (kind: ProductionDocKind) => ["production-docs", kind];

export const useProductionDocs = (
  kind: ProductionDocKind,
  params: { dateFrom?: string; dateTo?: string; search?: string },
) =>
  useQuery({
    queryKey: [...key(kind), params],
    queryFn: () => getJson<ProductionDocListItem[]>(productionDocs[kind].endpoint, params),
  });

export const useProductionDoc = (kind: ProductionDocKind, id: number | null) =>
  useQuery({
    queryKey: [...key(kind), "detail", id],
    queryFn: () => getJson<ProductionDocument>(`${productionDocs[kind].endpoint}/${id}`),
    enabled: Boolean(id),
  });

export const useProductionDefaults = (kind: ProductionDocKind) =>
  useQuery({
    queryKey: [...key(kind), "defaults"],
    queryFn: () => getJson<ProductionDefaults>(`${productionDocs[kind].endpoint}/defaults`),
    staleTime: 5 * 60 * 1000,
  });

/** What a product's last output actually cost: the planned cost a new production line starts with. */
export const fetchPlannedCosts = (productIds: number[]) =>
  // productIds=1&productIds=2: the shape the server binds a list from
  getJson<{ productId: number; unitCost?: number | null }[]>(
    `${productionDocs.report.endpoint}/planned-costs?${productIds.map((id) => `productIds=${id}`).join("&")}`,
  );

export const useSaveProductionDoc = (kind: ProductionDocKind) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number | null; body: ProductionDocSave }) => {
      if (id) {
        await $axiosPrivate.put(`${productionDocs[kind].endpoint}/${id}`, body);
        return id;
      }
      const { data } = await $axiosPrivate.post<number>(productionDocs[kind].endpoint, body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key(kind) }),
  });
};

export const useProductionAction = (kind: ProductionDocKind, action: "confirm" | "cancel" | "delete") => {
  const queryClient = useQueryClient();
  const endpoint = productionDocs[kind].endpoint;
  return useMutation({
    mutationFn: (id: number) =>
      action === "delete"
        ? $axiosPrivate.delete(`${endpoint}/${id}`)
        : $axiosPrivate.post(`${endpoint}/${id}/${action}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key(kind) }),
  });
};
