import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { payrollPeriodKeys } from "../constants/queryKeys";
import { payrollPeriodService } from "../services/payrollPeriodService";

export const useGetPayrollPeriods = (params?: URLSearchParams) =>
  useQuery({
    queryKey: payrollPeriodKeys.list(params?.toString()),
    queryFn: () => payrollPeriodService.list(params),
    placeholderData: keepPreviousData,
  });
