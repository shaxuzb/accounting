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

export const createSalePricingLine = (
  line: SaleDocTable,
  index = 0,
): SalePricingLine => {
  const amount = roundMoney(line.amount || line.price || 0);

  return {
    ...line,
    amount,
    totalAmount: roundMoney(amount * line.quantity),
    rowKey: getPricingLineKey(line, index),
    marginPercent: getMarginBySalePrice(line.costPrice, amount),
  };
};
