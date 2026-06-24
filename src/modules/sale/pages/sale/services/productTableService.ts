import { $axiosPrivate } from "@/services/AxiosService";
import { saleEndpoints } from "../constants/endpoints";
import type { ProductTableByMarking } from "../types/type";

export const productTableService = {
  getByMarking: (markingNumber: string) => {
    return $axiosPrivate
      .get<ProductTableByMarking>(saleEndpoints.productTable.byMarking, {
        params: {
          markingNumber: markingNumber.trim(),
        },
      })
      .then((res) => res.data);
  },
};
