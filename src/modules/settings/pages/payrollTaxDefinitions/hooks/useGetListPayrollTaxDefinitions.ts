import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { payrollTaxDefinitionService } from "../api";
import { payrollTaxDefinitionKeys } from "../constants/queryKeys";

export const useGetListPayrollTaxDefinitions = (params?: URLSearchParams) =>
  useQuery({
    queryKey: payrollTaxDefinitionKeys.list(params?.toString()),
    queryFn: () => payrollTaxDefinitionService.list(params),
    placeholderData: keepPreviousData,
  });
