import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";

export interface TransferManualProductOption {
  id: number;
  name?: string;
  unitId?: number | null;
  unitName?: string | null;
  unit?: string | null;
  /** Kept unit by unit with a marking code; only such goods pick codes to move. */
  isPieceTracked?: boolean;
}

interface Params {
  isService?: boolean;
  warehouseId?: number | null;
}

export const useGetWarehouseTransferProducts = (params?: Params) =>
  useQuery({
    queryKey: ["warehouse-transfer", "manual-products", params ?? null],
    queryFn: async () => {
      const response = await $axiosPrivate.get<TransferManualProductOption[]>(
        selectListEndpoints.productsSelectList,
        {
          params: {
            IsService: params?.isService ?? false,
            ...(params?.warehouseId ? { warehouseId: params.warehouseId } : {}),
          },
        },
      );
      return response.data ?? [];
    },
    enabled: Boolean(params?.warehouseId),
  });
