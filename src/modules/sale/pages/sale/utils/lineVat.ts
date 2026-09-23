import type { SaleProductPriceLayer, SaleSelectedProduct } from "../types/type";
// @ts-expect-error Native Node test runner loads TypeScript source modules directly.
import { roundMoney } from "./pricing.ts";

export interface VatRateOption {
  id: number;
  name: string;
}

/**
 * Sotuv hujjatlarida kiritiladigan sotuv narxi har doim QQSsiz (net) narx.
 * QQS shu narxdan hisoblanib uning ustiga qo'shiladi, undan ajratib olinmaydi:
 * jami = sotuv narxi * miqdor + QQS. Yagona istisno — "Jami (QQS bilan)"
 * ustuni, u QQS bilan kiritiladi va undan net narx teskari hisoblanadi.
 */

/** "QQS 12%" ko'rinishidagi nomdan foizni ajratadi. */
export const getVatPercent = (
  vatRateId: number | null | undefined,
  options: VatRateOption[],
) => {
  const option = options.find((item) => item.id === Number(vatRateId));
  const match = String(option?.name ?? "").match(/(\d+(?:[.,]\d+)?)/);
  return match ? Number(match[1].replace(",", ".")) : 0;
};

/** QQSsiz summadan QQSni hisoblaydi. */
export const getVatAmount = (
  amount: number,
  vatRateId: number | null | undefined,
  options: VatRateOption[],
) => {
  const percent = getVatPercent(vatRateId, options);
  return percent ? roundMoney((amount * percent) / 100) : 0;
};

/** QQS bilan kiritilgan summadan QQSsiz summani chiqaradi. */
export const getNetAmountFromGross = (
  grossAmount: number,
  vatRateId: number | null | undefined,
  options: VatRateOption[],
) => {
  const percent = getVatPercent(vatRateId, options);
  return percent
    ? roundMoney(grossAmount / (1 + percent / 100))
    : roundMoney(grossAmount);
};

/** Satrning QQSsiz summasi. */
export const getLineAmount = (line: SaleSelectedProduct) =>
  roundMoney(line.quantity * line.unitPrice);

export const getLineNetAmount = (line: SaleSelectedProduct) =>
  getLineAmount(line);

/**
 * QQS satrning QQSsiz summasidan hisoblanadi (1C va server kabi), dona narxidan
 * emas: donadagi QQSni yaxlitlab miqdorga ko'paytirish bir necha donali satrda
 * serverdagi provodkadan tiyinlarga farq qilardi.
 */
export const getLineVatAmount = (
  line: SaleSelectedProduct,
  vatRates: VatRateOption[],
) => getVatAmount(getLineAmount(line), line.vatRateId, vatRates);

/** Satr jami = QQSsiz summa + QQS. */
export const getLineTotal = (
  line: SaleSelectedProduct,
  vatRates: VatRateOption[],
) => roundMoney(getLineAmount(line) + getLineVatAmount(line, vatRates));

/** QQS bilan kiritilgan satr jamisidan QQSsiz dona narxini chiqaradi. */
export const getNetUnitPriceFromTotal = (
  grossTotal: number | null | undefined,
  quantity: number | null | undefined,
  vatRateId: number | null | undefined,
  vatRates: VatRateOption[],
) => {
  const lineQuantity = Number(quantity ?? 0);
  if (lineQuantity <= 0) return 0;

  const netTotal = getNetAmountFromGross(
    Number(grossTotal ?? 0),
    vatRateId,
    vatRates,
  );
  return roundMoney(netTotal / lineQuantity);
};

export const getLayerSaleAmount = (layer: SaleProductPriceLayer) =>
  layer.writeOffQuantity * layer.salePrice;

export const getLayerVatAmount = (
  layer: SaleProductPriceLayer,
  vatRateId: number | null | undefined,
  vatRates: VatRateOption[],
) => getVatAmount(roundMoney(getLayerSaleAmount(layer)), vatRateId, vatRates);

export const getLayerTotal = (
  layer: SaleProductPriceLayer,
  vatRateId: number | null | undefined,
  vatRates: VatRateOption[],
) => {
  const amount = roundMoney(getLayerSaleAmount(layer));
  const vatAmount = getLayerVatAmount(layer, vatRateId, vatRates);
  return roundMoney(amount + vatAmount);
};
