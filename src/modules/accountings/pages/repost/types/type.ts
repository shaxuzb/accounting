export interface RepostFilter {
  periodId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  documentType?: number | null;
  documentId?: number | null;
}

export interface RepostDocument {
  documentType: number;
  documentId: number;
  postingDate: string;
}

/** What the server re-posted, in date order. */
export interface RepostResult {
  processedCount: number;
  documents: RepostDocument[];
}
