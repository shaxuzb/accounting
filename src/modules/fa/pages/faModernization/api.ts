import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { getJson } from "@/modules/accountings/services/request";

export interface FaModernizationListItem {
  id: number;
  docNumber: string;
  docDate: string;
  amount: number;
  assetCount: number;
  comment?: string | null;
  statusId: number;
}

export interface FaModernizationLine {
  id?: number | null;
  faAssetId: number;
  inventoryNumber?: string | null;
  assetName?: string | null;
  amount: number;
  capitalInvestmentAccountId: number;
  capitalInvestmentAccountNumber?: string | null;
  oldInitialCost?: number | null;
  oldUsefulLifeMonths?: number | null;
  newUsefulLifeMonths?: number | null;
  note?: string | null;
}

export interface FaModernizationDocument {
  id: number;
  docNumber: string;
  docDate: string;
  comment?: string | null;
  statusId: number;
  lines: FaModernizationLine[];
}

export interface FaModernizationSave {
  docDate: string;
  comment?: string | null;
  lines: {
    faAssetId: number;
    amount: number;
    capitalInvestmentAccountId: number;
    newUsefulLifeMonths?: number | null;
    note?: string | null;
  }[];
}

/** An asset in use with improvement costs gathered on an 08 account. */
export interface FaModernizationCandidate {
  faAssetId: number;
  inventoryNumber: string;
  assetName: string;
  initialCost: number;
  usefulLifeMonths?: number | null;
  capitalInvestmentAccountId: number;
  capitalInvestmentAccountNumber: string;
  balance: number;
}

const base = "/fa-modernizations";
const key = ["fa-modernizations"];

export const useFaModernizations = (params: { dateFrom?: string; dateTo?: string }) =>
  useQuery({
    queryKey: [...key, params],
    queryFn: () => getJson<FaModernizationListItem[]>(base, params),
  });

export const useFaModernization = (id: number | null) =>
  useQuery({
    queryKey: [...key, "detail", id],
    queryFn: () => getJson<FaModernizationDocument>(`${base}/${id}`),
    enabled: Boolean(id),
  });

export const useFaModernizationCandidates = (date: string, enabled: boolean) =>
  useQuery({
    queryKey: [...key, "candidates", date],
    queryFn: () => getJson<FaModernizationCandidate[]>(`${base}/candidates`, { date }),
    enabled,
  });

export const useSaveFaModernization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number | null; body: FaModernizationSave }) => {
      if (id) {
        await $axiosPrivate.put(`${base}/${id}`, body);
        return id;
      }
      const { data } = await $axiosPrivate.post<number>(base, body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
};

export const useFaModernizationAction = (action: "confirm" | "cancel" | "delete") => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      action === "delete" ? $axiosPrivate.delete(`${base}/${id}`) : $axiosPrivate.post(`${base}/${id}/${action}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
};
