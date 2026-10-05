import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { getJson } from "@/modules/accountings/services/request";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import type { ManualEntry, ManualEntryListItem, ManualEntrySave } from "./types";

const base = "/manual-entries";

export const useManualEntries = (params: object) =>
  useQuery({
    queryKey: ["manual-entries", params],
    queryFn: () => getJson<ManualEntryListItem[]>(base, params),
  });

export const useManualEntry = (id: number | null) =>
  useQuery({
    queryKey: ["manual-entry", id],
    queryFn: () => getJson<ManualEntry>(`${base}/${id}`),
    enabled: !!id,
  });

const useEntryMutation = <T,>(fn: (arg: T) => Promise<unknown>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onError: errorHandlers,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["manual-entries"] });
      void queryClient.invalidateQueries({ queryKey: ["manual-entry"] });
    },
  });
};

export const useSaveManualEntry = () =>
  useEntryMutation(async ({ id, body }: { id: number | null; body: ManualEntrySave }) => {
    if (id) {
      await $axiosPrivate.put(`${base}/${id}`, body);
      return id;
    }
    const { data } = await $axiosPrivate.post<{ id: number }>(base, body);
    return data.id;
  });

export const useConfirmManualEntry = () =>
  useEntryMutation((id: number) => $axiosPrivate.post(`${base}/${id}/confirm`));

export const useCancelManualEntry = () =>
  useEntryMutation((id: number) => $axiosPrivate.post(`${base}/${id}/cancel`));

export const useDeleteManualEntry = () =>
  useEntryMutation((id: number) => $axiosPrivate.delete(`${base}/${id}`));
