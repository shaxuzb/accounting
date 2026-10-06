import type {
  SaleDocCreateForm,
  SaleDocForm,
  SaleDocUpdateForm,
  SaleProcessingMode,
} from "../types/form";
import type { SaleSelectedProduct } from "../types/type";
import { roundMoney } from "./pricing";

export {
  getIncompleteSaleMarkingLines,
  getSaleMarkingCount,
  hasRequiredSaleMarkings,
  isSaleMarkingComplete,
} from "./saleMarkings";

export const toSaleCreatePayload = (
  values: SaleDocForm,
  products: SaleSelectedProduct[],
  processingMode: SaleProcessingMode,
): SaleDocCreateForm => ({
  docDate: values.docDate,
  exchangeRate: Number(values.exchangeRate ?? 0),
  counterpartyId: values.counterpartyId ?? 0,
  warehouseId: values.warehouseId ?? 0,
  currencyId: values.currencyId ?? 0,
  contractId: values.contractId,
  customerAccountId: values.customerAccountId ?? 0,
  vatAccountId: values.vatAccountId ?? 0,
  comment: values.comment || null,
  processingMode,
  lines: products.map((product) => {
    const line = {
      productId: product.productId,
      quantity: product.quantity,
      costPrice: product.costPrice,
      unitId: product.unitId,
      unitPrice: roundMoney(product.unitPrice),
      amount: roundMoney(
        product.netAmount ?? product.quantity * product.unitPrice,
      ),
      vatRateId: product.vatRateId ?? null,
      inventoryAccountId: product.inventoryAccountId ?? 0,
      incomeAccountId: product.incomeAccountId ?? 0,
      costAccountId: product.costAccountId ?? 0,
      assembled: true as const,
    };

    const productBatches = toProductBatches(product);

    if (processingMode !== 2) {
      return productBatches.length ? { ...line, productBatches } : line;
    }

    return {
      ...line,
      ...(productBatches.length ? { productBatches } : {}),
      items: (product.markings ?? []).map(({ productTableId }) => ({
        productTableId,
      })),
      unmarkedQuantity: product.isPieceTracked
        ? Math.max(0, product.unmarkedQuantity ?? 0)
        : 0,
    };
  }),
});

const toProductBatches = (product: SaleSelectedProduct) =>
  (product.layers ?? [])
    .filter((layer) => layer.batchId && layer.writeOffQuantity > 0)
    .map((layer) => ({
      batchId: layer.batchId as number,
      quantity: layer.writeOffQuantity,
    }));

/**
 * The edit of a draft: the same header and lines as a new sale (accounts, rate and the
 * batches picked for each line), so nothing the user changed is left behind.
 */
export const toSaleUpdatePayload = (
  values: SaleDocForm,
  products: SaleSelectedProduct[],
): SaleDocUpdateForm => ({
  docDate: values.docDate,
  exchangeRate: Number(values.exchangeRate ?? 0),
  counterpartyId: values.counterpartyId ?? 0,
  warehouseId: values.warehouseId ?? 0,
  currencyId: values.currencyId ?? 0,
  contractId: values.contractId,
  customerAccountId: values.customerAccountId ?? null,
  vatAccountId: values.vatAccountId ?? null,
  comment: values.comment || null,
  lines: products.map((product) => {
    const productBatches = toProductBatches(product);
    return {
      id: product.id ?? null,
      productId: product.productId,
      quantity: product.quantity,
      costPrice: product.costPrice,
      unitId: product.unitId,
      unitPrice: roundMoney(product.unitPrice),
      vatRateId: product.vatRateId ?? null,
      inventoryAccountId: product.inventoryAccountId ?? undefined,
      incomeAccountId: product.incomeAccountId ?? undefined,
      costAccountId: product.costAccountId ?? undefined,
      ...(productBatches.length ? { productBatches } : {}),
    };
  }),
});
