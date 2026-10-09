import type { ManualArticle } from "../../types";
import { purchaseArticle } from "./purchases-purchase";

/** The articles that have content, by id; the rest of the sections show as «tez orada». */
export const manualArticles: Record<string, ManualArticle> = {
  [purchaseArticle.id]: purchaseArticle,
};
