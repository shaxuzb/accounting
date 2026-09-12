import { useQuery } from "@tanstack/react-query";
import { payrollEmployeeService } from "../api";
import { payrollEmployeeKeys } from "../constants/queryKeys";

export const useGetPayrollEmployeeHistory = (id?: string | number | null) =>
  useQuery({
    queryKey: [...payrollEmployeeKeys.detail(id ?? ""), "history"],
    queryFn: () => payrollEmployeeService.history(id as string | number),
    enabled: Boolean(id),
  });
