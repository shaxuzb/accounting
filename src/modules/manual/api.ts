import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";

const key = ["manual", "progress"] as const;

/** The articles the signed-in user has read (kept on the server, so any computer shows them). */
export const useManualProgress = () =>
  useQuery({
    queryKey: key,
    queryFn: async () => (await $axiosPrivate.get<string[]>("/manual/progress")).data ?? [],
    staleTime: 60 * 1000,
  });

export const useSetArticleRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ articleId, read }: { articleId: string; read: boolean }) =>
      read
        ? $axiosPrivate.put("/manual/progress", null, { params: { articleId } })
        : $axiosPrivate.delete("/manual/progress", { params: { articleId } }),
    onMutate: async ({ articleId, read }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<string[]>(key) ?? [];
      queryClient.setQueryData<string[]>(key, read
        ? Array.from(new Set([...previous, articleId]))
        : previous.filter((id) => id !== articleId));
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: key }),
  });
};
