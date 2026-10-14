import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getJson } from "../../services/request";

export interface TaxFormHeader {
  organizationName: string;
  inn?: string | null;
  address?: string | null;
  director?: string | null;
  chiefAccountant?: string | null;
  regimeName?: string | null;
  rate?: number | null;
}

export interface TaxFormLine {
  code: string;
  name: string;
  level: number;
  isTotal: boolean;
  value1: number | null;
  value2: number | null;
  value3: number | null;
  value4: number | null;
}

export interface TaxFormSheet {
  code: string;
  title: string;
  columns: string[];
  lines: TaxFormLine[];
  note?: string | null;
}

export interface TaxReconciliation {
  title: string;
  form: number;
  ledger: number;
  difference: number;
  note?: string | null;
}

export interface TaxForm {
  header: TaxFormHeader;
  dateFrom: string;
  dateTo: string;
  periodName: string;
  sheets: TaxFormSheet[];
  reconciliation: TaxReconciliation[];
  warnings: string[];
}

export interface VatRegisterRow {
  no: number;
  kind: string;
  documentTypeId: number;
  documentId: number;
  docNumber: string;
  counterpartyName?: string | null;
  counterpartyInn?: string | null;
  invoiceNumber: string;
  invoiceDate: string;
  hasEsf: boolean;
  net: number;
  vat: number;
  total: number;
  nonCreditableNet: number;
  nonCreditableVat: number;
}

export interface VatRegisterTotal {
  net: number;
  vat: number;
  nonCreditableNet: number;
  nonCreditableVat: number;
}

export interface VatRegister {
  header: TaxFormHeader;
  dateFrom: string;
  dateTo: string;
  purchases: VatRegisterRow[];
  purchasesBeforePeriod: VatRegisterTotal;
  purchasesPeriod: VatRegisterTotal;
  purchasesYear: VatRegisterTotal;
  sales: VatRegisterRow[];
  salesPeriod: VatRegisterTotal;
}

const base = "/reports/tax";

export const useVatReturn = (params: { year: number; month: number }) =>
  useQuery({
    queryKey: ["tax-reports", "vat-return", params],
    queryFn: () => getJson<TaxForm>(`${base}/vat-return`, params),
    placeholderData: keepPreviousData,
  });

export const useVatRegister = (params: { year: number; month: number }) =>
  useQuery({
    queryKey: ["tax-reports", "vat-register", params],
    queryFn: () => getJson<VatRegister>(`${base}/vat-register`, params),
    placeholderData: keepPreviousData,
  });

export const useTurnoverTax = (params: { year: number; month: number }) =>
  useQuery({
    queryKey: ["tax-reports", "turnover-tax", params],
    queryFn: () => getJson<TaxForm>(`${base}/turnover-tax`, params),
    placeholderData: keepPreviousData,
  });

export const useProfitTax = (params: { year: number; quarter: number }) =>
  useQuery({
    queryKey: ["tax-reports", "profit-tax", params],
    queryFn: () => getJson<TaxForm>(`${base}/profit-tax`, params),
    placeholderData: keepPreviousData,
  });
