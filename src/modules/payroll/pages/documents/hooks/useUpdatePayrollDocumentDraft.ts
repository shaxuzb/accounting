import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollDocumentKeys } from "../constants/queryKeys";
import { payrollDocumentService } from "../services/payrollDocumentService";
import type { PayrollDraftUpdateForm } from "../types/form";

export const useUpdatePayrollDocumentDraft = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayrollDraftUpdateForm) => payrollDocumentService.updateDraft(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: payrollDocumentKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: payrollDocumentKeys.all }),
      ]);
    },
  });
};
