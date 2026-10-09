import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";

export interface AdjustmentTypeOption {
  id: number;
  code: string;
  name: string;
}

/** The adjustment kinds (cmn_inventory_adjustment_type): the codes the server takes and their names. */
export const useGetInventoryAdjustmentTypes = () =>
  useQuery<AdjustmentTypeOption[]>({
    queryKey: ["manuals", "inventory-adjustment-types"],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<AdjustmentTypeOption[]>(
        "/manuals/inventory-adjustment-types",
      );
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
  });
