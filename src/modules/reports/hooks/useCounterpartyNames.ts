import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { reportManualEndpoints } from "../constants/endpoints";
import type { ManualSelectItem } from "../types/type";

/**
 * Kontragent registri faqat `counterpartyId` saqlaydi
 * (CounterpartyRegisterBalanceBaseDto), nomi yo'q. Debitor/kreditor
 * hisobotlarida ism ko'rinishi uchun ma'lumotnoma bir marta olinadi va
 * id → nom jadvaliga aylantiriladi.
 */
export const useCounterpartyNames = () => {
  const query = useQuery<ManualSelectItem[]>({
    queryKey: ["selectlist", "report-counterparties"],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<ManualSelectItem[]>(
        reportManualEndpoints.counterparties,
      );
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const nameById = new Map<number, string>(
    (query.data ?? []).map((item) => [Number(item.id), item.name]),
  );

  return {
    isLoading: query.isLoading,
    resolve: (counterpartyId: number) =>
      nameById.get(counterpartyId) ?? `#${counterpartyId}`,
  };
};
