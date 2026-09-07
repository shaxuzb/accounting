import { $axiosPrivate } from "@/services/AxiosService";
import { normalizeDocumentAccountOptions } from "@/shared/documentAccounts";
import { useQuery } from "@tanstack/react-query";

export const usePayrollChartAccounts = (enabled = true) =>
  useQuery({
    queryKey: ["payroll", "chart-accounts"],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<unknown>(
        "manuals/chart-accounts",
      );
      return normalizeDocumentAccountOptions(data);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
