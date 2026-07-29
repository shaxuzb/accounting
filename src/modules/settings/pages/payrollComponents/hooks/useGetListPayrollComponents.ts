import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { payrollComponentService } from "../api";
import { payrollComponentKeys } from "../constants/queryKeys";

export const useGetListPayrollComponents = (params?: URLSearchParams) =>
  useQuery({
    queryKey: payrollComponentKeys.list(params?.toString()),
    queryFn: () => payrollComponentService.list(params),
    placeholderData: keepPreviousData,
  });
