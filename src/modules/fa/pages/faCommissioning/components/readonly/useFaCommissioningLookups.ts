import { useCallback, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import type { SelectOptionItem } from "@/components/fields/SelectCustom";
import { $axiosPrivate } from "@/services/AxiosService";
import {
  chartAccountSelectedLabel,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { getLocalizedLabel } from "@/shared/utils/localizedLabel";
import { useAppSelector } from "@/store/hooks";

type LookupOption = SelectOptionItem & {
  inventoryNumber?: string;
  fullName?: string;
};

type SelectResponse = LookupOption[] | { items?: LookupOption[] };

const lookupDefinitions = [
  ["assets", selectListEndpoints.faAssetsSelectList],
  ["departments", selectListEndpoints.departmentsSelectList],
  ["users", selectListEndpoints.usersSelectList],
  ["methods", selectListEndpoints.depreciationMethodsSelectList],
  ["accounts", selectListEndpoints.chartAccountsSelectList],
] as const;

type LookupKey = (typeof lookupDefinitions)[number][0];

const fetchOptions = async (path: string) => {
  const { data } = await $axiosPrivate.get<SelectResponse>(path);
  return Array.isArray(data) ? data : (data.items ?? []);
};

const getAssetLabel = (item: LookupOption) => {
  const inventoryNumber = String(item.inventoryNumber ?? "").trim();
  const name = String(item.name ?? item.fullName ?? "").trim();
  return [inventoryNumber, name].filter(Boolean).join(" — ") || String(item.id);
};

export default function useFaCommissioningLookups() {
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

  const optionsByKey = useMemo(
    () =>
      Object.fromEntries(
        lookupDefinitions.map(([key], index) => [
          key,
          queries[index].data ?? [],
        ]),
      ) as Record<LookupKey, LookupOption[]>,
    [queries],
  );

  const findOption = useCallback(
    (key: LookupKey, id?: number | null) =>
      optionsByKey[key].find((item) => String(item.id) === String(id)),
    [optionsByKey],
  );

  const label = useCallback(
    (key: LookupKey, id?: number | null, fallbackKeys?: string[]) => {
      if (id == null) return "-";
      const option = findOption(key, id);
      return option
        ? getLocalizedLabel(option, lang, fallbackKeys) || String(id)
        : String(id);
    },
    [findOption, lang],
  );

  const assetLabel = useCallback(
    (id?: number | null) => {
      if (id == null) return "-";
      const asset = findOption("assets", id);
      return asset ? getAssetLabel(asset) : String(id);
    },
    [findOption],
  );

  const accountLabel = useCallback(
    (id?: number | null) => {
      if (id == null) return "-";
      const account = findOption("accounts", id);
      return account
        ? chartAccountSelectedLabel(account) ||
            getLocalizedLabel(account, lang) ||
            String(id)
        : String(id);
    },
    [findOption, lang],
  );

  return {
    assetLabel,
    accountLabel,
    departmentLabel: (id?: number | null) => label("departments", id),
    userLabel: (id?: number | null) =>
      label("users", id, ["fullName", "name", "username"]),
    methodLabel: (id?: number | null) => label("methods", id),
  };
}
