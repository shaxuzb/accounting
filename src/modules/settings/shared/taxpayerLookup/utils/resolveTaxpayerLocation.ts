import type { QueryClient } from "@tanstack/react-query";
import { taxpayerDictionaryService } from "../api";
import type { TaxpayerLookupDto } from "../types";
import { findDictionaryIdByCode } from "./findDictionaryIdByCode";

const lookupQueryKeys = {
  regions: ["settings", "taxpayerLookup", "regions"] as const,
  districts: (regionId: number) =>
    ["settings", "taxpayerLookup", "districts", regionId] as const,
};

export const resolveTaxpayerLocation = async (
  queryClient: QueryClient,
  taxpayer: Pick<TaxpayerLookupDto, "RegionCode" | "DistrictCode">,
) => {
  let regionId: number | null = null;
  let districtId: number | null = null;

  try {
    const regions = await queryClient.fetchQuery({
      queryKey: lookupQueryKeys.regions,
      queryFn: taxpayerDictionaryService.regions,
      staleTime: 5 * 60 * 1000,
    });
    regionId = findDictionaryIdByCode(regions, taxpayer.RegionCode);

    if (regionId !== null) {
      const districts = await queryClient.fetchQuery({
        queryKey: lookupQueryKeys.districts(regionId),
        queryFn: () => taxpayerDictionaryService.districts(regionId as number),
        staleTime: 5 * 60 * 1000,
      });
      districtId = findDictionaryIdByCode(districts, taxpayer.DistrictCode);
    }
  } catch {
    // Location mapping must not block scalar taxpayer fields from filling.
  }

  return { regionId, districtId };
};
