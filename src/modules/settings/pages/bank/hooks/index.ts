import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsBankService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export const useGetOrganizationBanks = (search?: string) =>
  useQuery({
    queryKey: queryKeys.mine(search),
    queryFn: () => settingsBankService.mine(search),
  });

export const useGetDirectoryBanks = (search: string, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.directory(search),
    queryFn: () => settingsBankService.directory(search),
    enabled,
  });

export const useAttachBanks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bankIds: number[]) => settingsBankService.attach(bankIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.all }),
  });
};

export const useDetachBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bankId: number) => settingsBankService.detach(bankId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.all }),
  });
};
