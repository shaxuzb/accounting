import { useQuery } from "@tanstack/react-query";
import { payrollComponentService } from "../api";
import { payrollComponentKeys } from "../constants/queryKeys";

export const useGetDetailPayrollComponent = (id?: string | number | null) =>
  useQuery({
    queryKey: payrollComponentKeys.detail(id ?? ""),
    queryFn: () => payrollComponentService.detail(id as string | number),
    enabled: Boolean(id),
  });
