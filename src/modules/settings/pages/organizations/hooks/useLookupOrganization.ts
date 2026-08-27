import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  isLookupResponseForIdentifier,
  resolveTaxpayerLocation,
  taxpayerLookupService,
} from "@/modules/settings/shared/taxpayerLookup";
import {
  isLegalEntity,
  mapTaxpayerToOrganization,
} from "../utils/mapTaxpayerToOrganization";

export const useLookupOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (identifier: string) => {
      const taxpayer = await taxpayerLookupService.lookup(identifier);
      if (!isLookupResponseForIdentifier(identifier, taxpayer)) {
        return {
          taxpayer,
          isLegalEntity: false,
          isMatch: false,
          values: {},
        };
      }
      const legalEntity = isLegalEntity(taxpayer);

      if (!legalEntity) {
        return {
          taxpayer,
          isLegalEntity: false,
          isMatch: true,
          values: {},
        };
      }

      const { regionId, districtId } = await resolveTaxpayerLocation(
        queryClient,
        taxpayer,
      );

      return {
        taxpayer,
        isLegalEntity: true,
        isMatch: true,
        values: mapTaxpayerToOrganization(taxpayer, { regionId, districtId }),
      };
    },
  });
};
