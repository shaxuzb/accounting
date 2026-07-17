import type {
  SaleDocCreateForm,
  SaleDocForm,
  SaleProcessingMode,
} from "../types/form";
import type { SaleSelectedProduct } from "../types/type";

export const getSaleMarkingCount = (product: SaleSelectedProduct) =>
  product.markings?.length ?? 0;

export const hasRequiredSaleMarkings = (products: SaleSelectedProduct[]) =>
  products.every(
    (product) =>
      !product.isPieceTracked ||
      getSaleMarkingCount(product) === Math.round(product.quantity),
  );

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
      unitPrice: product.unitPrice,
      vatRateId: product.vatRateId ?? null,
      inventoryAccountId: product.inventoryAccountId ?? 0,
      incomeAccountId: product.incomeAccountId ?? 0,
      costAccountId: product.costAccountId ?? 0,
      assembled: true as const,
    };

    if (processingMode !== 2) {
      const productBatches = (product.layers ?? [])
        .filter((layer) => layer.batchId && layer.writeOffQuantity > 0)
        .map((layer) => ({
          batchId: layer.batchId as number,
          quantity: layer.writeOffQuantity,
        }));

      return productBatches.length ? { ...line, productBatches } : line;
    }

    return {
      ...line,
      items: (product.markings ?? []).map(({ productTableId }) => ({
        productTableId,
      })),
    };
  }),
});
