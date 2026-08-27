export interface DictionaryCodeItem {
  id: number;
  code?: string | number | null;
  regionCode?: string | number | null;
  districtCode?: string | number | null;
  Code?: string | number | null;
  RegionCode?: string | number | null;
  DistrictCode?: string | number | null;
  region_code?: string | number | null;
  district_code?: string | number | null;
}

const normalizeCode = (value: unknown) => {
  const normalized = String(value ?? "").trim();
  if (/^\d+$/.test(normalized)) return String(Number(normalized));
  return normalized.toLowerCase();
};

const getDictionaryCode = (item: DictionaryCodeItem) =>
  item.code ??
  item.regionCode ??
  item.districtCode ??
  item.Code ??
  item.RegionCode ??
  item.DistrictCode ??
  item.region_code ??
  item.district_code;

export const findDictionaryIdByCode = (
  items: DictionaryCodeItem[],
  code: string | null,
) => {
  if (!code) return null;
  return (
    items.find(
      (item) => normalizeCode(getDictionaryCode(item)) === normalizeCode(code),
    )?.id ?? null
  );
};
