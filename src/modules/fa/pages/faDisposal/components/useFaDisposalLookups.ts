import { useCallback, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import type {
  SelectCustomDisplayConfig,
  SelectOptionItem,
} from "@/components/fields/SelectCustom";
import { $axiosPrivate } from "@/services/AxiosService";
import {
  chartAccountSelectedLabel,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { getLocalizedLabel } from "@/shared/utils/localizedLabel";
import { useAppSelector } from "@/store/hooks";

type AssetOption = SelectOptionItem & {
  inventoryNumber?: string;
  fullName?: string;
};

type LookupOption = AssetOption;
type SelectResponse = LookupOption[] | { items?: LookupOption[] };

const lookupDefinitions = [
  ["assets", selectListEndpoints.faAssetsSelectList],
  ["accounts", selectListEndpoints.chartAccountsSelectList],
  ["disposalTypes", selectListEndpoints.faDisposalTypesSelectList],
] as const;

type LookupKey = (typeof lookupDefinitions)[number][0];

const fetchOptions = async (path: string) => {
  const { data } = await $axiosPrivate.get<SelectResponse>(path);
  return Array.isArray(data) ? data : (data.items ?? []);
};

const getAssetLabel = (item: SelectOptionItem) => {
  const asset = item as AssetOption;
  const inventoryNumber = String(asset.inventoryNumber ?? "").trim();
  const name = String(asset.name ?? asset.fullName ?? "").trim();
  return [inventoryNumber, name].filter(Boolean).join(" — ") || String(item.id);
};

export const faDisposalAssetDisplayConfig: SelectCustomDisplayConfig = {
  optionLabel: getAssetLabel,
  selectedLabel: getAssetLabel,
  searchFields: ["inventoryNumber", "name", "fullName"],
};

export default function useFaDisposalLookups() {
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
  const assetsData = queries[0].data;
  const accountsData = queries[1].data;
  const disposalTypesData = queries[2].data;

  const optionsByKey = useMemo(
    () =>
      ({
        assets: assetsData ?? [],
        accounts: accountsData ?? [],
        disposalTypes: disposalTypesData ?? [],
      }) satisfies Record<LookupKey, LookupOption[]>,
    [accountsData, assetsData, disposalTypesData],
  );

  const findOption = useCallback(
    (key: LookupKey, id?: number | null) =>
      optionsByKey[key].find((item) => String(item.id) === String(id)),
    [optionsByKey],
  );

  const assetLabel = useCallback(
    (id?: number | null) => {
      if (id == null) return "-";
      const asset = findOption("assets", id);
      return asset ? getAssetLabel(asset) : String(id);
    },
    [findOption],
  );

  const localizedLabel = useCallback(
    (key: LookupKey, id?: number | null) => {
      if (id == null) return "-";
      const option = findOption(key, id);
      return option ? getLocalizedLabel(option, lang) || String(id) : String(id);
    },
    [findOption, lang],
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
    disposalTypeLabel: (id?: number | null) =>
      localizedLabel("disposalTypes", id),
  };
}
