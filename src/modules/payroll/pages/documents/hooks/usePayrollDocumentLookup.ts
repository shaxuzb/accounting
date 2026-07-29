import { useQuery } from "@tanstack/react-query";
import { PAYROLL_STATUS } from "../../../constants/options";
import { payrollDocumentKeys } from "../constants/queryKeys";
import { payrollDocumentService } from "../services/payrollDocumentService";

/**
 * Tasdiqlangan hisoblash hujjatlari.
 * Tuzatish hujjati va FINAL to'lov yaratishda tanlanadi.
 */
export const usePayrollDocumentLookup = (periodId?: number | null) =>
  useQuery({
    queryKey: payrollDocumentKeys.lookup(periodId),
    queryFn: () =>
      payrollDocumentService.list({
        page: 1,
        pageSize: 100,
        statusId: PAYROLL_STATUS.posted,
        ...(periodId ? { periodId } : {}),
      }),
    enabled: Boolean(periodId),
    staleTime: 60 * 1000,
    select: (data) => data.items ?? [],
  });
