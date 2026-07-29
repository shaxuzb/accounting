import { useQuery } from "@tanstack/react-query";
import { payrollDocumentKeys } from "../constants/queryKeys";
import { payrollDocumentService } from "../services/payrollDocumentService";

export const useGetDetailPayrollDocument = (id?: string | number | null) =>
  useQuery({
    queryKey: payrollDocumentKeys.detail(id ?? ""),
    queryFn: () => payrollDocumentService.detail(id as string | number),
    enabled: Boolean(id),
  });
