import { $axiosPrivate } from "@/services/AxiosService";
import { saleEndpoints } from "../constants/endpoints";

export const productPriceService = {
  details: (productId: string | number) =>
    $axiosPrivate
      .get<unknown>(saleEndpoints.productPrice.detail(productId))
      .then((res) => res.data),
};
