import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  isLookupResponseForIdentifier,
  resolveTaxpayerLocation,
  taxpayerLookupService,
} from "@/modules/settings/shared/taxpayerLookup";
import { mapTaxpayerToCounterparty } from "../utils/mapTaxpayerToCounterparty";

export const useLookupCounterparty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (identifier: string) => {
      const taxpayer = await taxpayerLookupService.lookup(identifier);
      if (!isLookupResponseForIdentifier(identifier, taxpayer)) {
        return { taxpayer, isMatch: false, values: {} };
      }

      const location = await resolveTaxpayerLocation(queryClient, taxpayer);

      return {
        taxpayer,
        isMatch: true,
        values: mapTaxpayerToCounterparty(taxpayer, location),
      };
    },
  });
};
