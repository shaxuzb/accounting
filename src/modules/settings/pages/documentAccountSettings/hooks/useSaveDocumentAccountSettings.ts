import { useMutation, useQueryClient } from "@tanstack/react-query";
import { documentAccountSettingsService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { DocumentAccountSettingsBatchPayload } from "../types/type";
import { documentAccountQueryKeys } from "@/shared/documentAccounts";

export const useSaveDocumentAccountSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DocumentAccountSettingsBatchPayload) =>
      documentAccountSettingsService.save(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      queryClient.invalidateQueries({ queryKey: documentAccountQueryKeys.all });
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "selectlist" &&
          query.queryKey.some(
            (part) =>
              typeof part === "string" &&
              part.includes("document-account-settings"),
          ),
      });
    },
  });
};
