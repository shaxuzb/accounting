import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { payrollDocumentKeys } from "../constants/queryKeys";
import { payrollDocumentService } from "../services/payrollDocumentService";

export const useGetPayrollDocuments = (params?: URLSearchParams) =>
  useQuery({
    queryKey: payrollDocumentKeys.list(params?.toString()),
    queryFn: () => payrollDocumentService.list(params),
    placeholderData: keepPreviousData,
  });
