import { useQuery } from "@tanstack/react-query";
import { accountingEntriesReportService } from "../api";

export const useGetAccountingEntriesReport = (
  documentId?: string | number | null,
  documentTypeId: string | number = 1,
) =>
  useQuery({
    queryKey: [
      "accounting",
      "accountingentriesreport",
      documentTypeId,
      documentId,
    ],
    queryFn: () =>
      accountingEntriesReportService.postings({
        documentId: documentId ?? "",
        documentTypeId,
      }),
    enabled: Boolean(documentId),
  });
