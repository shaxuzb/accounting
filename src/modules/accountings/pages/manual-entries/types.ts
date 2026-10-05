export interface ManualEntrySubkonto {
  subkontoTypeId: number;
  entityId: number;
  displayValue?: string | null;
}

export interface ManualEntryLine {
  id?: number | null;
  debitAccountId: number;
  debitAccountNumber?: string | null;
  debitAccountName?: string | null;
  debitSubkontos: ManualEntrySubkonto[];
  creditAccountId: number;
  creditAccountNumber?: string | null;
  creditAccountName?: string | null;
  creditSubkontos: ManualEntrySubkonto[];
  /** In UZS. */
  amount: number;
  currencyId: number;
  currencyAmount?: number | null;
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
}

export interface ManualEntrySave {
  docDate: string;
  comment?: string | null;
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
