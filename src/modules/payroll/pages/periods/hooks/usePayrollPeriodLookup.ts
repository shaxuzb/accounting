import { useQuery } from "@tanstack/react-query";
import { payrollPeriodKeys } from "../constants/queryKeys";
import { payrollPeriodService } from "../services/payrollPeriodService";

/**
 * Tanlash uchun davrlar ro'yxati.
 * status berilsa faqat OPEN yoki CLOSED davrlar qaytadi.
 */
export const usePayrollPeriodLookup = (status?: "OPEN" | "CLOSED") =>
  useQuery({
    queryKey: payrollPeriodKeys.lookup(status ?? "all"),
    queryFn: () =>
      payrollPeriodService.list({
        page: 1,
        pageSize: 200,
        ...(status ? { status } : {}),
      }),
    staleTime: 2 * 60 * 1000,
    select: (data) => data.items ?? [],
  });
