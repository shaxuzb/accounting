import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { getJson } from "@/modules/accountings/services/request";

export const conversionPermissions = {
  view: "INVENTORY_CONVERSION_VIEW",
  create: "INVENTORY_CONVERSION_CREATE",
  delete: "INVENTORY_CONVERSION_DELETE",
  confirm: "INVENTORY_CONVERSION_CONFIRM",
  cancel: "INVENTORY_CONVERSION_CANCEL",
} as const;

/** inv_conversion_doc.kind */
export const conversionKinds = { assembly: 1, disassembly: 2, regrading: 3, accountTransfer: 4 } as const;
export type ConversionKind = (typeof conversionKinds)[keyof typeof conversionKinds];

/** The three journals: 1C «Комплектация номенклатуры» (assembly and disassembly), «Пересортица», between accounts. */
export type ConversionJournal = "assembly" | "regrading" | "accounts";

export const conversionJournals: Record<ConversionJournal, { path: string; titleKey: string; hintKey: string; kinds: ConversionKind[] }> = {
  assembly: {
    path: "/main/warehouses/assemblies",
    titleKey: "conversion.assembly.title",
    hintKey: "conversion.assembly.hint",
    kinds: [conversionKinds.assembly, conversionKinds.disassembly],
  },
  regrading: {
    path: "/main/warehouses/regradings",
    titleKey: "conversion.regrading.title",
    hintKey: "conversion.regrading.hint",
    kinds: [conversionKinds.regrading],
  },
  accounts: {
    path: "/main/warehouses/account-transfers",
    titleKey: "conversion.accounts.title",
    hintKey: "conversion.accounts.hint",
    kinds: [conversionKinds.accountTransfer],
  },
};

/** DocumentStatusIdConst: 1 draft, 2 posted, 3 cancelled. */
export const conversionStatus = { draft: 1, posted: 2, cancelled: 3 } as const;

/** MovementDirectionIdConst */
export const direction = { in: 1, out: -1 } as const;

export interface ConversionListItem {
  id: number;
  kind: ConversionKind;
  docNumber: string;
  docDate: string;
  warehouseId: number;
  warehouseName?: string | null;
  summary?: string | null;
  amount: number;
  lineCount: number;
  comment?: string | null;
  statusId: number;
}

export interface ConversionLine {
  id?: number;
  directionId: number;
  pairNo: number;
  productId: number;
  productName?: string | null;
  unitName?: string | null;
  quantity: number;
  costShare?: number | null;
  inventoryAccountId?: number | null;
  inventoryAccountNumber?: string | null;
  amount?: number;
}

export interface Conversion {
  id: number;
  kind: ConversionKind;
  docNumber: string;
  docDate: string;
  warehouseId: number;
  warehouseName?: string | null;
  comment?: string | null;
  statusId: number;
  lines: ConversionLine[];
}

export interface ConversionSave {
  kind: ConversionKind;
  docDate: string;
  warehouseId: number;
  comment: string | null;
  lines: {
    directionId: number;
    pairNo: number;
    productId: number;
    quantity: number;
    costShare: number | null;
    inventoryAccountId: number | null;
  }[];
}

const base = "/conversions";
const key = ["conversions"] as const;

export const useConversions = (journal: ConversionJournal, params: Record<string, unknown>) =>
  useQuery({
    queryKey: [...key, "list", journal, params],
    queryFn: () => getJson<ConversionListItem[]>(base, { ...params, kind: conversionJournals[journal].kinds[0] }),
  });

export const useConversion = (id: number | null) =>
  useQuery({
    queryKey: [...key, id],
    queryFn: () => getJson<Conversion>(`${base}/${id}`),
    enabled: Boolean(id),
  });

export const useStockAccounts = () =>
  useQuery({
    queryKey: [...key, "stock-accounts"],
    queryFn: () => getJson<{ id: number; number: string; name: string }[]>(`${base}/stock-accounts`),
    staleTime: 5 * 60 * 1000,
  });

export const useSaveConversion = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number | null; body: ConversionSave }) => {
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

export const useConversionAction = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: "confirm" | "cancel" | "delete" }) =>
      action === "delete" ? $axiosPrivate.delete(`${base}/${id}`) : $axiosPrivate.post(`${base}/${id}/${action}`),
    onSuccess: () => void client.invalidateQueries({ queryKey: key }),
  });
};

export const money = (value: number | null | undefined) =>
  (value ?? 0).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
