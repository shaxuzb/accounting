import { payrollComponentService } from "@/modules/settings/pages/payrollComponents/api";
import { useQuery } from "@tanstack/react-query";

const LOOKUP_PARAMS = { page: 1, pageSize: 500, stateId: 1 };

/** Tanlash uchun faol hisoblash komponentlari. */
export const usePayrollComponentLookup = (componentType?: string) =>
  useQuery({
    queryKey: ["payroll", "components", "lookup", componentType ?? "all"],
    queryFn: () =>
      payrollComponentService.list(
        componentType ? { ...LOOKUP_PARAMS, componentType } : LOOKUP_PARAMS,
      ),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.items ?? [],
  });
