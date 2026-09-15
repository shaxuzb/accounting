import { useQuery } from "@tanstack/react-query";
import { payrollTaxDefinitionService } from "../api";
import { payrollTaxDefinitionKeys } from "../constants/queryKeys";

export const useGetDetailPayrollTaxDefinition = (
  id?: string | number | null,
) =>
  useQuery({
    queryKey: payrollTaxDefinitionKeys.detail(id ?? ""),
    queryFn: () => payrollTaxDefinitionService.detail(id as string | number),
    enabled: Boolean(id),
  });
