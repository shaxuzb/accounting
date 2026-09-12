import { useQuery } from "@tanstack/react-query";
import { payrollDocumentKeys } from "../constants/queryKeys";
import { payrollDocumentService } from "../services/payrollDocumentService";

export const useGetPayrollCorrectionBasis = (id?: string | number | null) =>
  useQuery({
    queryKey: payrollDocumentKeys.correctionBasis(id ?? ""),
    queryFn: () => payrollDocumentService.correctionBasis(id as string | number),
    enabled: Boolean(id),
  });
