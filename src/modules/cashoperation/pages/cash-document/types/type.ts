import type { CashOperation } from "../../cashoperation/types/type";

export type CashDocumentKind = "pko" | "rko";

export type CashDocument = CashOperation;

export interface CashDocumentLabels {
  kind: CashDocumentKind;
  listTitle: string;
  addTitle: string;
  detailTitle: string;
}

/** A correspondent account of a cash order's print (1C «Кредит» / «Дебет» of KO-1 / KO-2). */
export interface CashOrderPrintAccount {
  accountNumber: string;
  amount: number;
}

/** What the forms KO-1 (PKO with its receipt) and KO-2 (RKO) print. */
export interface CashOrderPrint {
  id: number;
  operationTypeId: number;
  docNumber: string;
  docDate: string;
  statusId: number;
  organizationName: string;
  organizationInn?: string | null;
  cashBoxName?: string | null;
  cashAccountNumber?: string | null;
  accounts: CashOrderPrintAccount[];
  amount: number;
  currencyCode: string;
  amountInWords: string;
  personName?: string | null;
  basis?: string | null;
  attachment?: string | null;
  idDocument?: string | null;
  director?: string | null;
  chiefAccountant?: string | null;
  cashier?: string | null;
}
