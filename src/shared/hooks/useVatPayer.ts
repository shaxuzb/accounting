import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";

interface VatPayerStatus {
  isVatPayer: boolean;
  noVatRateId: number;
}

/**
 * Whether the organization is a VAT payer on a date (accounting policy). A non-payer sells and
 * buys «QQSsiz» (1C «Без НДС»), so the document forms default its lines to that rate.
 */
export function useVatPayer(date?: string | null) {
  const day = date ? date.slice(0, 10) : undefined;
  const { data } = useQuery({
    queryKey: ["taxes", "vat-payer", day ?? "today"],
    queryFn: async () =>
      (await $axiosPrivate.get<VatPayerStatus>("/taxes/vat-payer", { params: day ? { date: day } : {} })).data,
    staleTime: 5 * 60 * 1000,
  });
  return {
    isVatPayer: data?.isVatPayer ?? true,
    noVatRateId: data?.noVatRateId ?? null,
  };
}
