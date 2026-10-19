import { useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { useAppSelector } from "@/store/hooks";

/**
 * The first time an organization receives an asset under a financial lease the server adds
 * what it lacks (0310, 0299, 7910, 6950, 6920, 9610 and the documents' account options); the
 * account lists are read again after it. True once the lease options can be loaded.
 */
export default function useLeaseSetup(needed: boolean) {
  const queryClient = useQueryClient();
  const organizationId = useAppSelector((state) => state.organization.id || null);
  const query = useQuery({
    queryKey: ["fa", "lease-setup", organizationId],
    queryFn: async () => {
      const { data } = await $axiosPrivate.post<{ changed: boolean }>("fa-receipts/lease-setup");
      if (!data?.changed) return true;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["settings", "document-account-settings"] }),
        queryClient.invalidateQueries({ queryKey: ["selectlist"] }),
      ]);
      return true;
    },
    enabled: needed && Boolean(organizationId),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
  return !needed || query.isSuccess;
}
