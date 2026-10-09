import type { ManualArticle } from "../../types";
import { purchaseArticle } from "./purchases-purchase";
import { contractsArticle } from "./purchases-contracts";
import { customsArticle } from "./purchases-customs";
import { extraCostsArticle } from "./purchases-extra-costs";
import { supplierReturnArticle } from "./purchases-supplier-return";
import { productsArticle } from "./warehouse-products";
import { adjustmentArticle } from "./warehouse-adjustment";
import { inventoryArticle } from "./warehouse-inventory";
import { stockArticle } from "./warehouse-stock";
import { transfersArticle } from "./warehouse-transfers";

/** The articles that have content, by id; the rest of the sections show as «tez orada». */
export const manualArticles: Record<string, ManualArticle> = {
  [purchaseArticle.id]: purchaseArticle,
  [supplierReturnArticle.id]: supplierReturnArticle,
  [extraCostsArticle.id]: extraCostsArticle,
  [customsArticle.id]: customsArticle,
  [contractsArticle.id]: contractsArticle,
  [productsArticle.id]: productsArticle,
  [stockArticle.id]: stockArticle,
  [transfersArticle.id]: transfersArticle,
  [inventoryArticle.id]: inventoryArticle,
  [adjustmentArticle.id]: adjustmentArticle,
};
