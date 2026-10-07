import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { getJson } from "@/modules/accountings/services/request";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import type { DeferredExpense, DeferredExpenseSave } from "./types";

const base = "/deferred-expenses";

export const useDeferredExpenses = () =>
  useQuery({
    queryKey: ["deferred-expenses"],
    queryFn: () => getJson<DeferredExpense[]>(base),
  });

export const useSaveDeferredExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, body }: { itemId: number | null; body: DeferredExpenseSave }) => {
      if (itemId) {
        await $axiosPrivate.put(`${base}/${itemId}`, body);
        return itemId;
      }
      const { data } = await $axiosPrivate.post<number>(base, body);
      return data;
    },
    onError: errorHandlers,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["deferred-expenses"] });
      void queryClient.invalidateQueries({ queryKey: ["selectlist"] });
    },
  });
};
