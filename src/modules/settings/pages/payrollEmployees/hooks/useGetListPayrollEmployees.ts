import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { payrollEmployeeService } from "../api";
import { payrollEmployeeKeys } from "../constants/queryKeys";

export const useGetListPayrollEmployees = (params?: URLSearchParams) =>
  useQuery({
    queryKey: payrollEmployeeKeys.list(params?.toString()),
    queryFn: () => payrollEmployeeService.list(params),
    placeholderData: keepPreviousData,
  });
