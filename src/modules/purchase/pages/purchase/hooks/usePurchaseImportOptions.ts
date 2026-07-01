import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import {
  selectListEndpoints,
  selectListKeys,
} from "@/shared/constants/selectLists";
import type {
  ProductListResponse,
  ProductSelectOption,
  PurchaseMode,
  SelectOption,
} from "../types/type";
import {
  getProductCode,
  normalizeProductOptions,
} from "../utils/purchaseImport";

export const usePurchaseImportOptions = (purchaseMode: PurchaseMode) => {
  const productQuery = useQuery<ProductSelectOption[]>({
    queryKey: ["selectlist", selectListKeys.product, "purchase-goods"],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<
        ProductSelectOption[] | ProductListResponse
      >("products", {
        params: {
          IsService: false,
          PageSize: 1000,
        },
      });
      return normalizeProductOptions(data);
    },
    enabled: true,
  });

  const serviceQuery = useQuery<ProductSelectOption[]>({
    queryKey: ["selectlist", selectListKeys.product, "purchase-services"],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<
        ProductSelectOption[] | ProductListResponse
      >("products", {
        params: {
          IsService: true,
          PageSize: 1000,
        },
      });
      return normalizeProductOptions(data);
    },
    enabled: true,
  });

  const unitQuery = useQuery<SelectOption[]>({
    queryKey: ["selectlist", selectListKeys.unit],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<SelectOption[]>(
        selectListEndpoints.unitsSelectList,
      );
      return data ?? [];
    },
    enabled: true,
  });

  const vatRateQuery = useQuery<SelectOption[]>({
    queryKey: ["selectlist", selectListKeys.vatRate],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<SelectOption[]>(
        selectListEndpoints.vatRatesSelectList,
      );
      return data ?? [];
    },
    enabled: true,
  });

  const productLookupOptions = useMemo(
    () => [...(productQuery.data ?? []), ...(serviceQuery.data ?? [])],
    [productQuery.data, serviceQuery.data],
  );

  const productIdBySapCode = useMemo(() => {
    const map = new Map<string, number>();
    productLookupOptions.forEach((item) => {
      const codes = [item.code, item.barcode, item.mxik].filter(Boolean);
      codes.forEach((code) => {
        map.set(String(code).trim(), Number(item.id));
      });
    });
    return map;
  }, [productLookupOptions]);

  const productByCode = useMemo(() => {
    const map = new Map<string, ProductSelectOption>();
    productLookupOptions.forEach((item) => {
      const codes = [item.code, item.barcode, item.mxik].filter(Boolean);
      codes.forEach((code) => {
        map.set(String(code).trim(), item);
      });
    });
    return map;
  }, [productLookupOptions]);

  const itemOptions = useMemo<ProductSelectOption[]>(
    () =>
      purchaseMode === "services"
        ? (serviceQuery.data ?? [])
        : (productQuery.data ?? []).map((item) => ({
            ...item,
            code: getProductCode(item),
          })),
    [productQuery.data, purchaseMode, serviceQuery.data],
  );

  return {
    data: productQuery.data,
    isFetching: productQuery.isFetching,
    isLoading: productQuery.isLoading,
    isSuccess: productQuery.isSuccess,
    refetchProducts: productQuery.refetch,
    isServicesLoading: serviceQuery.isLoading,
    isServicesSuccess: serviceQuery.isSuccess,
    itemOptions,
    productByCode,
    productIdBySapCode,
    serviceOptions: serviceQuery.data ?? [],
    unitOptions: unitQuery.data ?? [],
    vatRateOptions: vatRateQuery.data ?? [],
  };
};
