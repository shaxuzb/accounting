import { useMutation } from "@tanstack/react-query";
import {
  isLookupResponseForIdentifier,
  taxpayerLookupService,
} from "@/modules/settings/shared/taxpayerLookup";
import { mapTaxpayerToRentalLessor } from "../utils/mapTaxpayerToRentalLessor";

export const useLookupRentalLessor = () =>
  useMutation({
    mutationFn: async (identifier: string) => {
      const taxpayer = await taxpayerLookupService.lookup(identifier);

      return {
        taxpayer,
        isMatch: isLookupResponseForIdentifier(identifier, taxpayer),
        values: mapTaxpayerToRentalLessor(taxpayer),
      };
    },
  });
