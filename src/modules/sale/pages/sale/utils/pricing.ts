import type { SaleDocTable, SalePricingLine } from "../types/type";

export const roundMoney = (value: number) =>
  Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;

export const getSalePriceByMargin = (
  costPrice: number,
  marginPercent: number,
) => roundMoney(costPrice * (1 + marginPercent / 100));

export const getMarginBySalePrice = (costPrice: number, salePrice: number) =>
  costPrice > 0
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

export const createSalePricingLine = (
  line: SaleDocTable,
): SalePricingLine => ({
  ...line,
  marginPercent: getMarginBySalePrice(line.costPrice, line.amount),
});
