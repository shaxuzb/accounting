import type { SaleDocTable, SalePricingLine } from "../types/type";

export const roundMoney = (value: number) =>
  Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;

export const getSalePriceByMargin = (
  costPrice: number,
  marginPercent: number,
) => roundMoney(costPrice * (1 + marginPercent / 100));

export const getSalePriceByMarginAmount = (
  costPrice: number,
  marginAmount: number,
) => roundMoney(costPrice + marginAmount);

export const getMarginBySalePrice = (costPrice: number, salePrice: number) =>
  costPrice > 0 && salePrice > 0
    ? roundMoney(((salePrice - costPrice) / costPrice) * 100)
    : 0;

export const getVatPercent = (vatRateName?: string | null) => {
  const value = vatRateName?.match(/\d+(?:[.,]\d+)?/)?.[0];
  return value ? Number(value.replace(",", ".")) : 0;
};

export const getVatAmount = (
  salePrice: number,
  quantity: number,
  vatRateName?: string | null,
) => roundMoney(salePrice * quantity * (getVatPercent(vatRateName) / 100));

const getPricingLineKey = (line: SaleDocTable, index: number) =>
  line.rowKey ||
  line.markingNumber ||
  (line.productTableId ? `product-table-${line.productTableId}` : "") ||
  `line-${line.id}-${index}`;

/** The line total with VAT, as the document stores it. */
export const getLineTotal = (
  salePrice: number,
  quantity: number,
  vatRateName?: string | null,
) =>
  roundMoney(
    salePrice * quantity + getVatAmount(salePrice, quantity, vatRateName),
  );

/** UZS stock cost in the document's currency (rate = UZS for one unit, 1 for UZS). */
export const toDocumentCost = (costPrice: number, rate: number) =>
  rate > 1 ? roundMoney((costPrice || 0) / rate) : costPrice || 0;

export const createSalePricingLine = (
  line: SaleDocTable,
  index = 0,
  rate = 1,
): SalePricingLine => {
  const amount = roundMoney(line.amount || line.price || 0);
  const docCostPrice = toDocumentCost(line.costPrice, rate);

  return {
    ...line,
    amount,
    docCostPrice,
    vatAmount: getVatAmount(amount, line.quantity, line.vatRateName),
    totalAmount: getLineTotal(amount, line.quantity, line.vatRateName),
    rowKey: getPricingLineKey(line, index),
    marginPercent: getMarginBySalePrice(docCostPrice, amount),
  };
};
