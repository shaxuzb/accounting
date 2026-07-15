import { useMutation, useQueryClient } from "@tanstack/react-query";
import { documentAccountSettingsService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { DocumentAccountSettingsBatchPayload } from "../types/type";

export const useSaveDocumentAccountSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DocumentAccountSettingsBatchPayload) =>
      documentAccountSettingsService.save(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
