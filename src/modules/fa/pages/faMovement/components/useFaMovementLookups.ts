import { useCallback, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import type { SelectCustomDisplayConfig, SelectOptionItem } from "@/components/fields/SelectCustom";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { getLocalizedLabel } from "@/shared/utils/localizedLabel";
import { useAppSelector } from "@/store/hooks";

export type FaMovementAssetOption = SelectOptionItem & {
  inventoryNumber?: string;
  fullName?: string;
  departmentId?: number | null;
  departmentName?: string | null;
  responsibleUserId?: number | null;
  responsibleUserName?: string | null;
};

type SelectResponse = FaMovementAssetOption[] | { items?: FaMovementAssetOption[] };

const lookupDefinitions = [
  ["assets", selectListEndpoints.faAssetsSelectList],
  ["departments", selectListEndpoints.departmentsSelectList],
  ["users", selectListEndpoints.usersSelectList],
] as const;

type LookupKey = (typeof lookupDefinitions)[number][0];

const fetchOptions = async (path: string) => {
  const { data } = await $axiosPrivate.get<SelectResponse>(path);
  return Array.isArray(data) ? data : (data.items ?? []);
};

const getAssetLabel = (item: SelectOptionItem) => {
  const asset = item as FaMovementAssetOption;
  const inventoryNumber = String(asset.inventoryNumber ?? "").trim();
  const name = String(asset.name ?? asset.fullName ?? "").trim();
  return [inventoryNumber, name].filter(Boolean).join(" — ") || String(item.id);
};

export const faMovementAssetDisplayConfig: SelectCustomDisplayConfig = {
  optionLabel: getAssetLabel,
  selectedLabel: getAssetLabel,
  searchFields: ["inventoryNumber", "name", "fullName"],
};

export default function useFaMovementLookups() {
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
  const departmentsData = queries[1].data;
  const usersData = queries[2].data;

  const optionsByKey = useMemo(() => {
    return {
      assets: assetsData ?? [],
      departments: departmentsData ?? [],
      users: usersData ?? [],
    } satisfies Record<LookupKey, FaMovementAssetOption[]>;
  }, [assetsData, departmentsData, usersData]);

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

  const getAsset = useCallback(
    (id?: number | null) => findOption("assets", id),
    [findOption],
  );

  const assetLabel = useCallback(
    (id?: number | null) => {
      if (id == null) return "-";
      const asset = getAsset(id);
      return asset ? getAssetLabel(asset) : String(id);
    },
    [getAsset],
  );

  const departmentLabel = useCallback(
    (id?: number | null) => label("departments", id),
    [label],
  );

  const userLabel = useCallback(
    (id?: number | null) => label("users", id, ["fullName", "name", "username"]),
    [label],
  );

  return {
    assets: optionsByKey.assets,
    getAsset,
    assetLabel,
    departmentLabel,
    userLabel,
  };
}
