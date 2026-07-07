export interface RepostFilter {
  periodId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  documentType?: number | null;
  documentId?: number | null;
}

export type RepostResult = unknown;
