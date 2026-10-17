import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { getJson } from "@/modules/accountings/services/request";

export const powerOfAttorneyPermissions = {
  view: "POWER_OF_ATTORNEY_VIEW",
  create: "POWER_OF_ATTORNEY_CREATE",
  delete: "POWER_OF_ATTORNEY_DELETE",
} as const;

export const powerOfAttorneyPath = "/main/purchases/powers-of-attorney";

/** 1 issued, 2 done (a posted purchase names it), 3 returned unused (NSBU 4 p. 99), 4 cancelled. */
export const powerOfAttorneyStatus = { issued: 1, done: 2, returned: 3, cancelled: 4 } as const;

export interface PowerOfAttorneyListItem {
  id: number;
  docNumber: string;
  docDate: string;
  validUntil: string;
  agentName: string;
  agentPosition?: string | null;
  counterpartyId: number;
  counterpartyName?: string | null;
  contractNumber?: string | null;
  basisDocument?: string | null;
  statusId: number;
  overdue: boolean;
  purchases: string[];
}

export interface PowerOfAttorneyLine {
  id?: number | null;
  productId?: number | null;
  name: string;
  unitId?: number | null;
  unitName?: string | null;
  quantity: number;
}

export interface PowerOfAttorney {
  id: number;
  docNumber: string;
  docDate: string;
  validUntil: string;
  employeeId: number;
  agentName: string;
  agentPosition?: string | null;
  agentPinfl?: string | null;
  passportSeries?: string | null;
  passportNumber?: string | null;
  passportIssuedBy?: string | null;
  passportIssuedDate?: string | null;
  counterpartyId: number;
  counterpartyName?: string | null;
  contractId?: number | null;
  contractNumber?: string | null;
  contractDate?: string | null;
  basisDocument?: string | null;
  comment?: string | null;
  statusId: number;
  overdue: boolean;
  purchases: { id: number; docNumber: string; docDate: string; statusId: number }[];
  lines: PowerOfAttorneyLine[];
}

export interface PowerOfAttorneySave {
  docDate: string;
  validUntil: string;
  employeeId: number;
  agentPosition: string | null;
  passportSeries: string | null;
  passportNumber: string | null;
  passportIssuedBy: string | null;
  passportIssuedDate: string | null;
  counterpartyId: number;
  contractId: number | null;
  basisDocument: string | null;
  comment: string | null;
  lines: { productId: number | null; name: string; unitId: number | null; quantity: number }[];
}

export interface PowerOfAttorneyAgent {
  employeeId: number;
  name: string;
  position?: string | null;
  pinfl?: string | null;
  passportSeries?: string | null;
  passportNumber?: string | null;
  passportIssuedBy?: string | null;
  passportIssuedDate?: string | null;
}

export interface PowerOfAttorneyPrint {
  document: PowerOfAttorney;
  organizationName: string;
  organizationInn?: string | null;
  organizationAddress?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  bankCode?: string | null;
  director?: string | null;
  chiefAccountant?: string | null;
}

const base = "/powers-of-attorney";
const key = ["powers-of-attorney"] as const;

export const usePowersOfAttorney = (params: Record<string, unknown>) =>
  useQuery({
    queryKey: [...key, "list", params],
    queryFn: () => getJson<PowerOfAttorneyListItem[]>(base, params),
  });

export const usePowerOfAttorney = (id: number | null) =>
  useQuery({
    queryKey: [...key, id],
    queryFn: () => getJson<PowerOfAttorney>(`${base}/${id}`),
    enabled: Boolean(id),
  });

export const usePowerOfAttorneyPrint = (id: number | null) =>
  useQuery({
    queryKey: [...key, id, "print"],
    queryFn: () => getJson<PowerOfAttorneyPrint>(`${base}/${id}/print`),
    enabled: Boolean(id),
  });

export const usePowerOfAttorneyAgents = () =>
  useQuery({
    queryKey: [...key, "agents"],
    queryFn: () => getJson<PowerOfAttorneyAgent[]>(`${base}/agents`),
    staleTime: 60 * 1000,
  });

/** The supplier's powers a purchase on the date can be received by. */
export const useUsablePowersOfAttorney = (counterpartyId: number | null | undefined, date: string | null | undefined) =>
  useQuery({
    queryKey: [...key, "usable", counterpartyId, date],
    queryFn: () => getJson<PowerOfAttorneyListItem[]>(`${base}/usable`, { counterpartyId, date }),
    enabled: Boolean(counterpartyId && date),
  });

export const useSavePowerOfAttorney = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number | null; body: PowerOfAttorneySave }) => {
      if (id) {
        await $axiosPrivate.put(`${base}/${id}`, body);
        return id;
      }
      const { data } = await $axiosPrivate.post<number>(base, body);
      return data;
    },
    onSuccess: () => void client.invalidateQueries({ queryKey: key }),
  });
};

export const useSetPowerOfAttorneyStatus = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statusId }: { id: number; statusId: number }) => $axiosPrivate.put(`${base}/${id}/status/${statusId}`),
    onSuccess: () => void client.invalidateQueries({ queryKey: key }),
  });
};

export const useDeletePowerOfAttorney = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => $axiosPrivate.delete(`${base}/${id}`),
    onSuccess: () => void client.invalidateQueries({ queryKey: key }),
  });
};
