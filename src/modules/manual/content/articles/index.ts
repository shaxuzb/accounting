import type { ManualArticle } from "../../types";
import { purchaseArticle } from "./purchases-purchase";
import { supplierReturnArticle } from "./purchases-supplier-return";

/** The articles that have content, by id; the rest of the sections show as «tez orada». */
export const manualArticles: Record<string, ManualArticle> = {
  [purchaseArticle.id]: purchaseArticle,
  [supplierReturnArticle.id]: supplierReturnArticle,
};
