export interface ManualEntrySubkonto {
  subkontoTypeId: number;
  entityId: number;
  displayValue?: string | null;
}

export interface ManualEntryLine {
  id?: number | null;
  /** Empty (0 / null) on the other side of an off-balance account (001–009). */
  debitAccountId: number | null;
  debitAccountNumber?: string | null;
  debitAccountName?: string | null;
  debitSubkontos: ManualEntrySubkonto[];
  creditAccountId: number | null;
  creditAccountNumber?: string | null;
  creditAccountName?: string | null;
  creditSubkontos: ManualEntrySubkonto[];
  /** In UZS. */
  amount: number;
  currencyId: number;
  currencyAmount?: number | null;
  /** An expense report's goods line: the quantity coming into the warehouse of its debit analytics. */
  quantity?: number | null;
  content?: string | null;
}

export interface ManualEntry {
  id: number;
  docNumber: string;
  docDate: string;
  comment?: string | null;
  statusId: number;
  postedAt?: string | null;
  cancelledAt?: string | null;
  /** 1 manual entry, 2 an accountable person's expense report. */
  kind?: number;
  employeeId?: number | null;
  advanceAccountId?: number | null;
  /** An expense report's currency (the advance's: 4225 ... in a foreign currency). */
  currencyId?: number;
  lines: ManualEntryLine[];
}

export interface ManualEntryListItem {
  id: number;
  docNumber: string;
  docDate: string;
  comment?: string | null;
  statusId: number;
  totalAmount: number;
  lineCount: number;
  accounts?: string | null;
  kind?: number;
  employeeId?: number | null;
}

export interface ManualEntrySave {
  docDate: string;
  comment?: string | null;
  kind?: number;
  employeeId?: number | null;
  advanceAccountId?: number | null;
  lines: ManualEntryLine[];
}

/** cmn document status ids. */
export const manualEntryStatus = { draft: 1, posted: 2, cancelled: 3 } as const;

export const manualEntryPermissions = {
  view: "MANUAL_ENTRY_VIEW",
  create: "MANUAL_ENTRY_CREATE",
  delete: "MANUAL_ENTRY_DELETE",
  confirm: "MANUAL_ENTRY_CONFIRM",
  cancel: "MANUAL_ENTRY_CANCEL",
} as const;
