import type {
  SaleDocCreateForm,
  SaleDocForm,
  SaleProcessingMode,
} from "../types/form";
import type { SaleSelectedProduct } from "../types/type";
import { roundMoney } from "./pricing";

export const getSaleMarkingCount = (product: SaleSelectedProduct) =>
  product.markings?.length ?? 0;

export const hasRequiredSaleMarkings = (products: SaleSelectedProduct[]) =>
  products.every((product) => {
    if (!product.isPieceTracked) return true;

    const quantity = Math.max(0, Math.round(product.quantity));
    if (getSaleMarkingCount(product) !== quantity) return false;
    if (!quantity) return true;

    const selectedLayers = (product.layers ?? []).filter(
      (layer) => layer.batchId && layer.writeOffQuantity > 0,
    );
    if (!selectedLayers.length) return false;

    const markingsByBatch = new Map<number, number>();
    product.markings?.forEach((marking) => {
      if (!marking.batchId) return;
      markingsByBatch.set(
        marking.batchId,
        (markingsByBatch.get(marking.batchId) ?? 0) + 1,
      );
    });

    return (
      selectedLayers.every(
        (layer) =>
          markingsByBatch.get(layer.batchId as number) ===
          Math.round(layer.writeOffQuantity),
      ) &&
      product.markings?.every((marking) =>
        selectedLayers.some(
          (layer) => layer.batchId === marking.batchId,
        ),
      )
    );
  });

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

    const productBatches = (product.layers ?? [])
      .filter((layer) => layer.batchId && layer.writeOffQuantity > 0)
      .map((layer) => ({
        batchId: layer.batchId as number,
        quantity: layer.writeOffQuantity,
      }));

    if (processingMode !== 2) {
      return productBatches.length ? { ...line, productBatches } : line;
    }

    return {
      ...line,
      ...(productBatches.length ? { productBatches } : {}),
      items: (product.markings ?? []).map(({ productTableId }) => ({
        productTableId,
      })),
    };
  }),
});
