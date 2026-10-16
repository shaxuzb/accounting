import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { getJson } from "@/modules/accountings/services/request";

/** 1C «Состояние счета», kept by hand. */
export const saleInvoiceStatus = {
  notPaid: 1,
  paidInPart: 2,
  paid: 3,
  cancelled: 4,
} as const;

export const saleInvoicePermissions = {
  view: "SALE_INVOICE_VIEW",
  create: "SALE_INVOICE_CREATE",
  delete: "SALE_INVOICE_DELETE",
} as const;

export const saleInvoicePath = "/main/sales/invoices";

export interface SaleInvoiceListItem {
  id: number;
  docNumber: string;
  docDate: string;
  counterpartyId: number;
  counterpartyName?: string | null;
  contractNumber?: string | null;
  currencyId: number;
  currencyCode?: string | null;
  dueDate?: string | null;
  totalAmount: number;
  statusId: number;
  comment?: string | null;
}

export interface SaleInvoiceLine {
  id?: number;
  productId: number | null;
  productName?: string | null;
  unitId?: number | null;
  unitName?: string | null;
  quantity: number;
  price: number;
  vatRateId?: number | null;
  vatRate?: number;
  amount?: number;
  vatAmount?: number;
  totalAmount?: number;
}

export interface SaleInvoice {
  id: number;
  docNumber: string;
  docDate: string;
  counterpartyId: number;
  counterpartyName?: string | null;
  contractId?: number | null;
  contractNumber?: string | null;
  bankAccountId?: number | null;
  currencyId: number;
  dueDate?: string | null;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  comment?: string | null;
  statusId: number;
  sales: { id: number; docNumber: string; docDate: string; statusId: number }[];
  lines: SaleInvoiceLine[];
}

export interface SaleInvoicePrint {
  invoice: SaleInvoice;
  organizationName: string;
  organizationInn?: string | null;
  organizationVatCode?: string | null;
  organizationAddress?: string | null;
  organizationPhone?: string | null;
  director?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  bankCode?: string | null;
  customerName?: string | null;
  customerInn?: string | null;
  customerAddress?: string | null;
  currencyCode?: string | null;
  amountInWords: string;
}

export interface SaleInvoiceSave {
  docDate: string;
  counterpartyId: number;
  contractId: number | null;
  bankAccountId: number | null;
  currencyId: number;
  dueDate: string | null;
  comment: string | null;
  lines: { productId: number; unitId?: number | null; quantity: number; price: number; vatRateId?: number | null }[];
}

const base = "/sale-invoices";
const listKey = ["sale-invoices"] as const;

export const useSaleInvoices = (params: Record<string, unknown>) =>
  useQuery({
    queryKey: [...listKey, "list", params],
    queryFn: () => getJson<SaleInvoiceListItem[]>(base, params),
  });

export const useSaleInvoice = (id: number | null) =>
  useQuery({
    queryKey: [...listKey, id],
    queryFn: () => getJson<SaleInvoice>(`${base}/${id}`),
    enabled: Boolean(id),
  });

export const useSaleInvoicePrint = (id: number | null) =>
  useQuery({
    queryKey: [...listKey, id, "print"],
    queryFn: () => getJson<SaleInvoicePrint>(`${base}/${id}/print`),
    enabled: Boolean(id),
  });

export const useSaveSaleInvoice = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number | null; body: SaleInvoiceSave }) => {
      if (id) {
        await $axiosPrivate.put(`${base}/${id}`, body);
        return id;
      }
      const { data } = await $axiosPrivate.post<number>(base, body);
      return data;
    },
    onSuccess: () => void client.invalidateQueries({ queryKey: listKey }),
  });
};

export const useSetSaleInvoiceStatus = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statusId }: { id: number; statusId: number }) =>
      $axiosPrivate.put(`${base}/${id}/status/${statusId}`),
    onSuccess: () => void client.invalidateQueries({ queryKey: listKey }),
  });
};

export const useDeleteSaleInvoice = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => $axiosPrivate.delete(`${base}/${id}`),
    onSuccess: () => void client.invalidateQueries({ queryKey: listKey }),
  });
};
