import { useQuery } from "@tanstack/react-query";
import { accountingEntriesReportService } from "../api";

export const useGetAccountingEntriesReport = (
  documentId?: string | number | null,
) =>
  useQuery({
    queryKey: ["accounting", "accountingentriesreport", documentId],
    queryFn: () =>
      accountingEntriesReportService.postings({
        documentId: documentId ?? "",
        documentTypeId: 1,
      }),
    enabled: Boolean(documentId),
  });
