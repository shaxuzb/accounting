import { useQuery } from "@tanstack/react-query";
import { accountingReportService } from "../api";
import { accountingReportKeys } from "../constants/queryKeys";
import type { JournalQuery } from "../types/type";

export const useGetJournal = (params?: JournalQuery) =>
  useQuery({
    queryKey: accountingReportKeys.journal(params ?? null),
    queryFn: () => accountingReportService.journal(params),
    enabled: Boolean(params),
  });
