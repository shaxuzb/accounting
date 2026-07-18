import { useQuery } from "@tanstack/react-query";
import { saleKeys } from "../constants/queryKeys";
import { saleDocService } from "../services/saleDocService";

export const useGetAvailableSaleProductMarkings = (
  productId: number | null | undefined,
  warehouseId: number | null | undefined,
  enabled = true,
) =>
  useQuery({
    queryKey: saleKeys.saleDoc.availableProductsByWarehouse(
      productId ?? 0,
      warehouseId ?? 0,
    ),
    queryFn: () =>
      saleDocService.availableProductsByWarehouse(
        productId as number,
        warehouseId as number,
      ),
    enabled: enabled && Boolean(productId) && Boolean(warehouseId),
  });
