import type {
  SaleDocCreateForm,
  SaleDocForm,
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
      unmarkedQuantity: product.isPieceTracked
        ? Math.max(0, product.unmarkedQuantity ?? 0)
        : 0,
    };
  }),
});
