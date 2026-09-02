import type { SaleSelectedProduct } from "../../sale/types/type";
import type {
  RetailSaleCreatePayload,
  RetailSaleFormValues,
  RetailSaleLinePayload,
  RetailSaleProcessingMode,
  RetailSaleUpdatePayload,
} from "../types/form";
import { roundMoney } from "../../sale/utils/pricing";
export { toRetailSalePaymentPayloads } from "./paymentPayload";

import { toRetailSalePaymentPayloads as toPayments } from "./paymentPayload";

const toLines = (
  products: SaleSelectedProduct[],
  withMarking: boolean,
): RetailSaleLinePayload[] =>
  products.map((product) => {
    const line: RetailSaleLinePayload = {
      productId: product.productId,
      quantity: product.quantity,
      unitId: product.unitId,
      unitPrice: roundMoney(product.unitPrice),
      costPrice: product.costPrice,
      amount: roundMoney(
        product.netAmount ?? product.quantity * product.unitPrice,
      ),
      vatAmount: roundMoney(product.vatAmount ?? 0),
      vatRateId: product.vatRateId ?? null,
      inventoryAccountId: product.inventoryAccountId ?? null,
      incomeAccountId: product.incomeAccountId ?? null,
      costAccountId: product.costAccountId ?? null,
    };

    if (withMarking && product.markings?.length) {
      line.items = product.markings.map(({ productTableId }) => ({
        productTableId,
      }));
    }

    return line;
  });

const toBasePayload = (
  values: RetailSaleFormValues,
  products: SaleSelectedProduct[],
  withMarking: boolean,
) => ({
  docDate: values.docDate,
  counterpartyId: values.counterpartyId
    ? Number(values.counterpartyId)
    : null,
  warehouseId: Number(values.warehouseId),
  cashRegisterId: Number(values.cashRegisterId),
  currencyId: Number(values.currencyId),
  exchangeRate: Number(values.exchangeRate || 0),
  receivableAccountId: values.receivableAccountId
    ? Number(values.receivableAccountId)
    : null,
  vatAccountId: values.vatAccountId ? Number(values.vatAccountId) : null,
  comment: values.comment.trim() || null,
  lines: toLines(products, withMarking),
  payments: toPayments(values.payments),
});

export const toRetailSaleCreatePayload = (
  values: RetailSaleFormValues,
  products: SaleSelectedProduct[],
  processingMode: RetailSaleProcessingMode,
  withMarking: boolean,
): RetailSaleCreatePayload => ({
  ...toBasePayload(values, products, withMarking),
  processingMode,
});

export const toRetailSaleUpdatePayload = (
  values: RetailSaleFormValues,
  products: SaleSelectedProduct[],
  withMarking: boolean,
): RetailSaleUpdatePayload => ({
  ...toBasePayload(values, products, withMarking),
  stateId: values.stateId,
});
