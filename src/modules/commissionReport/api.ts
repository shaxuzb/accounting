import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { getJson } from "@/modules/accountings/services/request";

export const commissionReportPermissions = {
  view: "COMMISSION_REPORT_VIEW",
  create: "COMMISSION_REPORT_CREATE",
  delete: "COMMISSION_REPORT_DELETE",
} as const;

/**
 * 1 — our commission agent's fee (1C «Отчет комиссионера о продажах»), under sales;
 * 2 — ours from a committent (1C «Отчет комитенту о продажах»), under purchases.
 */
export const commissionReportKinds = { fromAgent: 1, toCommittent: 2 } as const;
export type CommissionReportKind = (typeof commissionReportKinds)[keyof typeof commissionReportKinds];

export const commissionReportPath = (kind: CommissionReportKind) =>
  kind === commissionReportKinds.fromAgent ? "/main/sales/commission-reports" : "/main/purchases/committent-reports";

/** DocumentStatusIdConst: 1 draft, 2 posted, 3 cancelled. */
export const commissionReportStatus = { draft: 1, posted: 2, cancelled: 3 } as const;

export interface CommissionReportListItem {
  id: number;
  kind: CommissionReportKind;
  docNumber: string;
  docDate: string;
  warehouseId: number;
  warehouseName: string;
  counterpartyId: number;
  counterpartyName: string;
  periodFrom: string;
  periodTo: string;
  salesAmount: number;
  feePercent?: number | null;
  feeAmount: number;
  vatRateId?: number | null;
  vatAmount: number;
  contractId?: number | null;
  comment?: string | null;
  statusId: number;
}

export interface CommissionReportSale {
  id: number;
  docNumber: string;
  docDate: string;
  counterpartyName: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
}

export interface CommissionReport {
  document: CommissionReportListItem;
  sales: CommissionReportSale[];
}

export interface CommissionReportWarehouse {
  id: number;
  name: string;
  kind: number;
  counterpartyId: number;
  counterpartyName: string;
  contractId?: number | null;
}

export interface CommissionReportSave {
  kind: CommissionReportKind;
  docDate: string;
  warehouseId: number;
  periodFrom: string;
  periodTo: string;
  feePercent: number | null;
  feeAmount: number;
  vatRateId: number | null;
  comment: string | null;
}

const base = "/commission-reports";
const key = ["commission-reports"] as const;

export const useCommissionReports = (kind: CommissionReportKind, params: Record<string, unknown>) =>
  useQuery({
    queryKey: [...key, "list", kind, params],
    queryFn: () => getJson<CommissionReportListItem[]>(base, { ...params, kind }),
  });

export const useCommissionReport = (id: number | null) =>
  useQuery({
    queryKey: [...key, id],
    queryFn: () => getJson<CommissionReport>(`${base}/${id}`),
    enabled: Boolean(id),
  });

export const useCommissionWarehouses = (kind: CommissionReportKind) =>
  useQuery({
    queryKey: [...key, "warehouses", kind],
    queryFn: () => getJson<CommissionReportWarehouse[]>(`${base}/warehouses`, { kind }),
  });

/** The period's sales from the warehouse the fee is taken from. */
export const useCommissionSales = (warehouseId: number | null, from: string | null, to: string | null) =>
  useQuery({
    queryKey: [...key, "sales", warehouseId, from, to],
    queryFn: () => getJson<CommissionReportSale[]>(`${base}/sales`, { warehouseId, from, to }),
    enabled: Boolean(warehouseId && from && to),
  });

export const useVatRateOptions = () =>
  useQuery({
    queryKey: ["manuals", "vat-rates"],
    queryFn: () => getJson<{ id: number; name: string; code?: string | null }[]>("/manuals/vat-rates"),
    staleTime: 5 * 60 * 1000,
  });

export const useSaveCommissionReport = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number | null; body: CommissionReportSave }) => {
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

export const useCommissionReportAction = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: "confirm" | "cancel" | "delete" }) =>
      action === "delete" ? $axiosPrivate.delete(`${base}/${id}`) : $axiosPrivate.post(`${base}/${id}/${action}`),
    onSuccess: () => void client.invalidateQueries({ queryKey: key }),
  });
};

export const money = (value: number | null | undefined) =>
  (value ?? 0).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
