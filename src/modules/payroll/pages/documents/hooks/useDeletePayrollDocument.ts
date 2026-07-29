import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollDocumentKeys } from "../constants/queryKeys";
import { payrollDocumentService } from "../services/payrollDocumentService";

export const useDeletePayrollDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => payrollDocumentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollDocumentKeys.all });
    },
  });
};
