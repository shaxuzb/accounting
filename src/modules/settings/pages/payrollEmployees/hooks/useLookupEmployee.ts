import { useMutation } from "@tanstack/react-query";
import {
  isLookupResponseForIdentifier,
  taxpayerLookupService,
} from "@/modules/settings/shared/taxpayerLookup";
import { mapTaxpayerToEmployee } from "../utils/mapTaxpayerToEmployee";

export const useLookupEmployee = () =>
  useMutation({
    mutationFn: async (identifier: string) => {
      const taxpayer = await taxpayerLookupService.lookup(identifier);
      if (!isLookupResponseForIdentifier(identifier, taxpayer)) {
        return {
          taxpayer,
          isPerson: false,
          isMatch: false,
          values: {},
        };
      }
      return {
        taxpayer,
        isPerson: taxpayer.Pinfl !== null,
        isMatch: true,
        values: mapTaxpayerToEmployee(taxpayer),
      };
    },
  });
