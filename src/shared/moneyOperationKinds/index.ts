import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";

/** A kind of cash or bank operation (1C «Вид операции»). */
export interface MoneyOperationKind {
  id: number;
  code: string;
  name: string;
  /** 1 a receipt, 2 a payment. */
  direction: number;
  forCash: boolean;
  forBank: boolean;
  /** Account prefixes the offset may start with; empty: any that is not money. */
  offsetPrefixes: string[];
  /** 0 no counterparty, 1 optional, 2 required. */
  counterpartyMode: number;
  needsEmployee: boolean;
  defaultOffsetAccount?: { id: number; number: string; name: string } | null;
}

export type MoneyChannel = "cash" | "bank";

export const useMoneyOperationKinds = (channel: MoneyChannel, direction: number | null) =>
  useQuery({
    queryKey: ["money-operation-kinds", channel, direction],
    queryFn: () =>
      $axiosPrivate
        .get<MoneyOperationKind[]>("money-operation-kinds", { params: { channel, direction } })
        .then((response) => response.data),
    enabled: direction === 1 || direction === 2,
    staleTime: 5 * 60 * 1000,
  });

/** Whether an account number fits a kind (one of its prefixes, or any when it has none). */
export const kindAllowsAccount = (kind: MoneyOperationKind | undefined, number?: string | null) =>
  !kind || kind.offsetPrefixes.length === 0 || (!!number && kind.offsetPrefixes.some((prefix) => number.startsWith(prefix)));

export { MoneyOperationKindSelect } from "./MoneyOperationKindSelect";
