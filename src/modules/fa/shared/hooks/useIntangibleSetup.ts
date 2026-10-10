import { useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { useAppSelector } from "@/store/hooks";
import { faAssetKinds } from "../constants/assetKinds";

/**
 * The first time an organization works with intangible assets the server adds what it lacks
 * (the 04xx/05xx/0830 accounts, the documents' account options, the 04xx groups); the account
 * and group lists are read again after it. True once the kind's options can be loaded.
 */
export default function useIntangibleSetup(assetKindId: number | null | undefined) {
  const queryClient = useQueryClient();
  const organizationId = useAppSelector((state) => state.organization.id || null);
  const needed = assetKindId === faAssetKinds.intangible;
  const query = useQuery({
    queryKey: ["fa", "intangible-setup", organizationId],
    queryFn: async () => {
      const { data } = await $axiosPrivate.post<{ changed: boolean }>("fa-assets/intangible-setup");
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
