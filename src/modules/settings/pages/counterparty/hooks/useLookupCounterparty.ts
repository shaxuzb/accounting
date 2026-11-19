import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  isLookupResponseForIdentifier,
  resolveTaxpayerAccounts,
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
        return { taxpayer, isMatch: false, values: {}, accounts: [] };
      }

      const [location, accounts] = await Promise.all([
        resolveTaxpayerLocation(queryClient, taxpayer),
        // the bank accounts are a convenience: the card is filled without them
        resolveTaxpayerAccounts(taxpayer).catch(() => []),
      ]);

      return {
        taxpayer,
        isMatch: true,
        values: mapTaxpayerToCounterparty(taxpayer, location),
        accounts,
      };
    },
  });
};
