import { useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { useAppSelector } from "@/store/hooks";

/**
 * The first time an organization receives an asset under a financial lease the server adds
 * what it lacks (0310, 0299, 7910, 6950, 6920, 9610 and the documents' account options), or —
 * for a lessor handing one over (`fa/disposals/lease-setup`) — 0920, 4810, 4830, 9530, 7230,
 * 0990 and the disposal's options; the account lists are read again after it. True once the
 * lease options can be loaded.
 */
export default function useLeaseSetup(needed: boolean, endpoint = "fa-receipts/lease-setup") {
  const queryClient = useQueryClient();
  const organizationId = useAppSelector((state) => state.organization.id || null);
  const query = useQuery({
    queryKey: ["fa", "lease-setup", endpoint, organizationId],
    queryFn: async () => {
      const { data } = await $axiosPrivate.post<{ changed: boolean }>(endpoint);
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
