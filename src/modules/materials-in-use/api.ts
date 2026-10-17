import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { getJson } from "@/modules/accountings/services/request";
import type { ManualEntrySubkonto } from "@/modules/accountings/pages/manual-entries/types";

export const materialsInUsePermissions = {
  view: "MATERIALS_IN_USE_VIEW",
  create: "MATERIALS_IN_USE_CREATE",
  delete: "MATERIALS_IN_USE_DELETE",
  confirm: "MATERIALS_IN_USE_CONFIRM",
  cancel: "MATERIALS_IN_USE_CANCEL",
} as const;

/** inv_materials_in_use_doc.kind */
export const materialsInUseKinds = { transfer: 1, writeOff: 2, return: 3 } as const;
export type MaterialsInUseKind = (typeof materialsInUseKinds)[keyof typeof materialsInUseKinds];

/** 1C «Передача материалов в эксплуатацию», «Списание материалов из эксплуатации», «Возврат материалов из эксплуатации». */
export const materialsInUseJournals: Record<MaterialsInUseKind, { path: string; titleKey: string; hintKey: string }> = {
  1: { path: "/main/warehouses/materials-in-use", titleKey: "materialsInUse.titles.1", hintKey: "materialsInUse.hints.1" },
  2: { path: "/main/warehouses/materials-write-offs", titleKey: "materialsInUse.titles.2", hintKey: "materialsInUse.hints.2" },
  3: { path: "/main/warehouses/materials-returns", titleKey: "materialsInUse.titles.3", hintKey: "materialsInUse.hints.3" },
};

/** DocumentStatusIdConst: 1 draft, 2 posted, 3 cancelled. */
export const materialsInUseStatus = { draft: 1, posted: 2, cancelled: 3 } as const;

export interface MaterialsInUseListItem {
  id: number;
  kind: MaterialsInUseKind;
  docNumber: string;
  docDate: string;
  warehouseName?: string | null;
  summary?: string | null;
  amount: number;
  lineCount: number;
  comment?: string | null;
  statusId: number;
}

export interface MaterialsInUseLine {
  id?: number;
  productId: number;
  productName?: string | null;
  unitName?: string | null;
  quantity: number;
  employeeId?: number | null;
  employeeName?: string | null;
  inUseAccountId?: number | null;
  inUseAccountNumber?: string | null;
  sourceDocId?: number | null;
  sourceDocNumber?: string | null;
  sourceDocDate?: string | null;
  inventoryAccountId?: number | null;
  inventoryAccountNumber?: string | null;
  /** The line's own expense account (1C «Способ отражения расходов»); none — the document's. */
  expenseAccountId?: number | null;
  expenseAccountNumber?: string | null;
  expenseSubkontos?: ManualEntrySubkonto[];
  amount: number;
  inUseAmount: number;
  comment?: string | null;
}

export interface MaterialsInUse {
  id: number;
  kind: MaterialsInUseKind;
  docNumber: string;
  docDate: string;
  warehouseId?: number | null;
  warehouseName?: string | null;
  expenseAccountId?: number | null;
  expenseAccountNumber?: string | null;
  expenseSubkontos: ManualEntrySubkonto[];
  incomeAccountId?: number | null;
  incomeAccountNumber?: string | null;
  incomeSubkontos: ManualEntrySubkonto[];
  comment?: string | null;
  statusId: number;
  lines: MaterialsInUseLine[];
}

export interface MaterialsInUseSave {
  kind: MaterialsInUseKind;
  docDate: string;
  warehouseId: number | null;
  expenseAccountId: number | null;
  expenseSubkontos: ManualEntrySubkonto[];
  incomeAccountId: number | null;
  incomeSubkontos: ManualEntrySubkonto[];
  comment: string | null;
  lines: {
    productId: number;
    quantity: number;
    employeeId: number | null;
    inUseAccountId: number | null;
    sourceDocId: number | null;
    amount: number | null;
    expenseAccountId: number | null;
    expenseSubkontos: ManualEntrySubkonto[];
    comment: string | null;
  }[];
}

export interface MaterialsInUseDefaults {
  inUseAccounts: { id: number; number: string; name: string }[];
  expenseAccountPrefixes: string[];
  incomeAccountId?: number | null;
  incomeSubkontos: ManualEntrySubkonto[];
}

/** Items in use (1C «Материалы в эксплуатации»): an off-balance account, item, transfer and person. */
export interface MaterialsInUseBalance {
  accountId: number;
  accountNumber: string;
  productId: number;
  productName: string;
  unitName?: string | null;
  sourceDocId: number;
  sourceDocNumber?: string | null;
  sourceDocDate?: string | null;
  employeeId?: number | null;
  employeeName?: string | null;
  quantity: number;
  amount: number;
}

const base = "/materials-in-use";
const key = ["materials-in-use"] as const;

export const useMaterialsInUseList = (kind: MaterialsInUseKind, params: Record<string, unknown>) =>
  useQuery({
    queryKey: [...key, "list", kind, params],
    queryFn: () => getJson<MaterialsInUseListItem[]>(base, { ...params, kind }),
  });

export const useMaterialsInUse = (id: number | null) =>
  useQuery({
    queryKey: [...key, id],
    queryFn: () => getJson<MaterialsInUse>(`${base}/${id}`),
    enabled: Boolean(id),
  });

export const useMaterialsInUseDefaults = () =>
  useQuery({
    queryKey: [...key, "defaults"],
    queryFn: () => getJson<MaterialsInUseDefaults>(`${base}/defaults`),
    staleTime: 5 * 60 * 1000,
  });

export const useMaterialsInUseBalance = (date: string | null, exceptDocumentId: number | null, enabled = true) =>
  useQuery({
    queryKey: [...key, "balance", date, exceptDocumentId],
    queryFn: () => getJson<MaterialsInUseBalance[]>(`${base}/balance`, { date, exceptDocumentId }),
    enabled,
  });

export const useSaveMaterialsInUse = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number | null; body: MaterialsInUseSave }) => {
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

export const useMaterialsInUseAction = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: "confirm" | "cancel" | "delete" }) =>
      action === "delete" ? $axiosPrivate.delete(`${base}/${id}`) : $axiosPrivate.post(`${base}/${id}/${action}`),
    onSuccess: () => void client.invalidateQueries({ queryKey: key }),
  });
};

export const money = (value: number | null | undefined) =>
  (value ?? 0).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
