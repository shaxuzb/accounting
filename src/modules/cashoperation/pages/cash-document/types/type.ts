import type { CashOperation } from "../../cashoperation/types/type";

export type CashDocumentKind = "pko" | "rko";

export interface CashDocument extends CashOperation {}

export interface CashDocumentLabels {
  kind: CashDocumentKind;
  listTitle: string;
  addTitle: string;
  detailTitle: string;
}
