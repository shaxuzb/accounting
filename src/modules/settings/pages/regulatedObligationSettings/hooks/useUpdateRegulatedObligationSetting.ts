import { useMutation, useQueryClient } from "@tanstack/react-query";
import { regulatedObligationSettingsService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { RegulatedObligationSettingFormPayload } from "../types";

interface UpdateArgs {
  id: string | number;
  payload: RegulatedObligationSettingFormPayload;
}

export const useUpdateRegulatedObligationSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      regulatedObligationSettingsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
