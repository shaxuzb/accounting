import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";

interface InventoryValuation {
  method: "fifo" | "average";
}

/**
 * How the organization values the stock it gives out on a date (accounting policy, NSBU 4):
 * FIFO or the weighted average. The sale forms preview the cost the way the server posts it.
 */
export function useInventoryValuation(date?: string | null) {
  const day = date ? date.slice(0, 10) : undefined;
  const { data } = useQuery({
    queryKey: ["taxes", "inventory-valuation", day ?? "today"],
    queryFn: async () =>
      (
        await $axiosPrivate.get<InventoryValuation>("/taxes/inventory-valuation", {
          params: day ? { date: day } : {},
        })
      ).data,
    staleTime: 5 * 60 * 1000,
  });
  return { isAverage: data?.method === "average" };
}
