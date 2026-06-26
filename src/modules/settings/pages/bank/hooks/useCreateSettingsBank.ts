import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsBankService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { SettingsBankCreate } from "../types/type";

export const useCreateSettingsBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SettingsBankCreate) =>
      settingsBankService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
