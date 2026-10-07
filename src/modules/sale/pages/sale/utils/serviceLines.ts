import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { SaleDocProduct, SaleDocTable, SaleSelectedProduct } from "../types/type";
import { roundMoney } from "./pricing";
import { getVatAmount, type VatRateOption } from "./lineVat";

/** A service sold on the document (1C «Услуги» of a sale or of the retail report). */
export interface SaleServiceLine {
  rowKey: string;
  id?: number | null;
  productId: number | null;
  productName?: string;
  unitId: number | null;
  quantity: number;
  /** Net of VAT, as every sale price here. */
  unitPrice: number;
  vatRateId: number | null;
}

interface ServiceOption {
  id: number;
  name: string;
  unitId?: number | null;
  defaultVatRateId?: number | null;
}

type ListResponse<T> = T[] | { items?: T[]; results?: T[]; data?: T[] };
const listOf = <T,>(response: ListResponse<T> | null | undefined): T[] =>
  Array.isArray(response) ? response : (response?.items ?? response?.results ?? response?.data ?? []);

export const newServiceLine = (): SaleServiceLine => ({
  rowKey: `service-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  productId: null,
  unitId: null,
  quantity: 1,
  unitPrice: 0,
  vatRateId: null,
});

export const serviceNet = (line: SaleServiceLine) => roundMoney(line.quantity * line.unitPrice);

export const serviceVat = (line: SaleServiceLine, vatRates: VatRateOption[], vatPayer: boolean) =>
  vatPayer ? getVatAmount(serviceNet(line), line.vatRateId, vatRates) : 0;

/** A service line as a document line: no stock, no cost, no stock or cost account. */
export const serviceToSaleLine = (
  line: SaleServiceLine,
  vatRates: VatRateOption[],
  vatPayer: boolean,
): SaleSelectedProduct => ({
  id: line.id ?? null,
  rowKey: line.rowKey,
  productId: Number(line.productId),
  productName: line.productName ?? "",
  quantity: line.quantity,
  availableQuantity: line.quantity,
  costPrice: 0,
  netAmount: serviceNet(line),
  vatAmount: serviceVat(line, vatRates, vatPayer),
  unitId: Number(line.unitId),
  unitPrice: line.unitPrice,
  vatRateId: vatPayer ? line.vatRateId : null,
  inventoryAccountId: null,
  incomeAccountId: null,
  costAccountId: null,
  isPieceTracked: false,
});

export const useSaleServiceOptions = () => {
  const services = useQuery({
    queryKey: ["selectlist", "products", "sale-services"],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<ListResponse<ServiceOption>>(selectListEndpoints.productsSelectList, {
        params: { IsService: true, PageSize: 1000 },
      });
      return listOf(data);
    },
    staleTime: 5 * 60 * 1000,
  });
  const vatRates = useQuery({
    queryKey: ["selectlist", "vat-rates"],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<ListResponse<VatRateOption>>(selectListEndpoints.vatRatesSelectList);
      return listOf(data);
    },
    staleTime: 5 * 60 * 1000,
  });
  return { services: services.data ?? [], vatRates: vatRates.data ?? [], loading: services.isLoading };
};

/** The service lines of a saved document. */
export const savedServiceLines = (lines: (SaleDocProduct | SaleDocTable)[]): SaleServiceLine[] =>
  lines
    .filter((line) => line.isService)
    .map((line, index) => ({
      rowKey: `service-${line.id ?? index}`,
      id: line.id,
      productId: line.productId,
      productName: line.productName,
      unitId: Number(line.unitId ?? 0) || null,
      quantity: Number(line.quantity ?? 0),
      unitPrice: Number(line.unitPrice ?? 0),
      vatRateId: line.vatRateId ?? null,
    }));

/** The first thing missing on a service line, or null when every line is complete. */
export const serviceLinesError = (lines: SaleServiceLine[]) => {
  if (lines.some((line) => !line.productId)) return "saleServices.errors.service";
  if (lines.some((line) => !line.unitId)) return "saleServices.errors.unit";
  if (lines.some((line) => !(line.quantity > 0))) return "saleServices.errors.quantity";
  if (lines.some((line) => !(line.unitPrice > 0))) return "saleServices.errors.price";
  return null;
};
