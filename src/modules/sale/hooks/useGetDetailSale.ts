import { useQuery } from "@tanstack/react-query";
import { saleKeys } from "../constants/queryKeys";
import { saleService } from "../services/saleService";

export const useGetDetailSale = (id: string | number) =>
  useQuery({
    queryKey: saleKeys.docs.detail(id),
    queryFn: () => saleService.detail(id),
    enabled: Boolean(id),
  });

export const useGetSaleLines = (
  ownerId: string | number,
  enabled = true,
) =>
  useQuery({
    queryKey: saleKeys.tables.list(ownerId),
    queryFn: () => saleService.lines(ownerId),
    enabled: Boolean(ownerId) && enabled,
  });
