import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsBankService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { SettingsBankUpdate } from "../types/type";

interface UpdateArgs {
  id: string | number;
  payload: SettingsBankUpdate;
}

export const useUpdateSettingsBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      settingsBankService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
