import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollDocumentKeys } from "../constants/queryKeys";
import { payrollDocumentService } from "../services/payrollDocumentService";

export const useRecalculatePayrollDocument = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => payrollDocumentService.recalculate(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: payrollDocumentKeys.all }),
        queryClient.invalidateQueries({ queryKey: payrollDocumentKeys.detail(id) }),
      ]);
    },
  });
};
