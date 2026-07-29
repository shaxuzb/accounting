import { useQuery } from "@tanstack/react-query";
import { payrollEmployeeService } from "../api";
import { payrollEmployeeKeys } from "../constants/queryKeys";

export const useGetDetailPayrollEmployee = (id?: string | number | null) =>
  useQuery({
    queryKey: payrollEmployeeKeys.detail(id ?? ""),
    queryFn: () => payrollEmployeeService.detail(id as string | number),
    enabled: Boolean(id),
  });
