import type {
  SaleAccountingLine,
  SaleDocTable,
  VatRateOption,
} from "../types/type";

export const roundMoney = (value: number) =>
  Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;

export const amountFromMargin = (costPrice: number, marginPercent: number) =>
  roundMoney(costPrice * (1 + marginPercent / 100));

export const marginFromAmount = (costPrice: number, amount: number) =>
  costPrice > 0 ? roundMoney(((amount - costPrice) / costPrice) * 100) : 0;

export const vatPercentFromOption = (option?: VatRateOption) => {
  if (!option) return 0;
  const directValue = option.rate ?? option.percentage ?? option.value;
  if (directValue !== undefined && Number.isFinite(Number(directValue))) {
    return Number(directValue);
  }

  const match = `${option.name} ${option.code ?? ""}`.match(/\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(",", ".")) : 0;
};

export const vatAmountFromSale = (
  amount: number,
  quantity: number,
  vatPercent: number,
) => roundMoney(amount * quantity * (vatPercent / 100));

export const toAccountingLine = (line: SaleDocTable): SaleAccountingLine => {
  const amount = line.amount;
  return {
    ...line,
    amount,
    marginPercent: marginFromAmount(line.costPrice, amount),
  };
};
