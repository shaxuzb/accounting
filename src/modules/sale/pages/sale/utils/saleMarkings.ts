import type { SaleSelectedProduct } from "../types/type";

export const getSaleMarkingCount = (product: SaleSelectedProduct) =>
  product.markings?.length ?? 0;

/**
 * A marked line is ready to leave the warehouse when every unit is accounted for:
 * its code was scanned, or the seller stated it is one of the old code-less units.
 */
export const isSaleMarkingComplete = (product: SaleSelectedProduct) => {
  if (!product.isPieceTracked) return true;
  const quantity = Number(product.quantity ?? 0);
  if (quantity <= 0 || quantity !== Math.trunc(quantity)) return false;
  return (
    getSaleMarkingCount(product) + Math.max(0, product.unmarkedQuantity ?? 0) ===
    quantity
  );
};

export const getIncompleteSaleMarkingLines = (products: SaleSelectedProduct[]) =>
  products.filter((product) => !isSaleMarkingComplete(product));

export const hasRequiredSaleMarkings = (products: SaleSelectedProduct[]) =>
  getIncompleteSaleMarkingLines(products).length === 0;
