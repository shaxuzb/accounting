import { useCallback, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import {
  chartAccountSelectedLabel,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { getLocalizedLabel } from "@/shared/utils/localizedLabel";
import { useAppSelector } from "@/store/hooks";

type SelectOption = Record<string, unknown> & {
  id: number;
  number?: unknown;
  code?: unknown;
  name?: unknown;
};

type SelectResponse = SelectOption[] | { items?: SelectOption[] };

const lookupDefinitions = [
  ["counterparties", selectListEndpoints.counterpartiesSelectList],
  ["currencies", selectListEndpoints.currenciesSelectList],
  ["receiptTypes", selectListEndpoints.faReceiptTypesSelectList],
  ["vatRates", selectListEndpoints.vatRatesSelectList],
  ["accounts", selectListEndpoints.chartAccountsSelectList],
  ["faGroups", selectListEndpoints.faGroupsSelectList],
  ["okofs", selectListEndpoints.okofsSelectList],
] as const;

export type FaReceiptLookupKey = (typeof lookupDefinitions)[number][0];

const fetchOptions = async (path: string) => {
  const { data } = await $axiosPrivate.get<SelectResponse>(path);
  return Array.isArray(data) ? data : (data.items ?? []);
};

export default function useFaReceiptLookups() {
  const lang = useAppSelector((state) => state.lang.lang);
  const queries = useQueries({
    queries: lookupDefinitions.map(([, path]) => ({
      queryKey: ["selectlist", lang, path, undefined, {}],
      queryFn: () => fetchOptions(path),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnMount: false as const,
    })),
  });

  const optionsByKey = useMemo(() => {
    const result = {} as Record<FaReceiptLookupKey, SelectOption[]>;
    lookupDefinitions.forEach(([key], index) => {
      result[key] = queries[index].data ?? [];
    });
    return result;
  }, [queries]);

  const findOption = useCallback(
    (key: FaReceiptLookupKey, id?: number | null) =>
      optionsByKey[key].find((item) => String(item.id) === String(id)),
    [optionsByKey],
  );

  const label = useCallback(
    (
      key: FaReceiptLookupKey,
      id?: number | null,
      fallbackKeys?: string[],
    ) => {
      if (id == null) return "-";
      const option = findOption(key, id);
      return option
        ? getLocalizedLabel(option, lang, fallbackKeys) || String(id)
        : String(id);
    },
    [findOption, lang],
  );

  const accountLabel = useCallback(
    (id?: number | null) => {
      if (id == null) return "-";
      const account = findOption("accounts", id);
      return account ? chartAccountSelectedLabel(account) : String(id);
    },
    [findOption],
  );

  return { label, accountLabel };
}
