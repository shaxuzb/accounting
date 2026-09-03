import { useMutation, useQueryClient } from "@tanstack/react-query";
import { regulatedObligationSettingsService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { RegulatedObligationSettingFormPayload } from "../types";

export const useCreateRegulatedObligationSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegulatedObligationSettingFormPayload) =>
      regulatedObligationSettingsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
