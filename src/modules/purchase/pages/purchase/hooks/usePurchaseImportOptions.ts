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

export const usePurchaseImportOptions = (
  purchaseMode: PurchaseMode,
) => {
  const productQuery = useQuery<ProductSelectOption[]>({
    queryKey: [
      "selectlist",
      selectListKeys.product,
      "purchase-goods-manual",
    ],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<
        ProductSelectOption[] | ProductListResponse
      >(selectListEndpoints.productsSelectList, {
        params: {
          IsService: false,
          //  Purchase mahsulotlari warehouse bo'yicha filterlanmaydi.
          PageSize: 1000,
        },
      });
      return normalizeProductOptions(data);
    },
    enabled: true,
  });

  const serviceQuery = useQuery<ProductSelectOption[]>({
    queryKey: [
      "selectlist",
      selectListKeys.product,
      "purchase-services-manual",
    ],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<
        ProductSelectOption[] | ProductListResponse
      >(selectListEndpoints.productsSelectList, {
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

  const productQueryData = productQuery.data ?? [];
  const serviceQueryData = serviceQuery.data ?? [];
  const allProductOptions = useMemo(
    () => [...productQueryData, ...serviceQueryData],
    [productQueryData, serviceQueryData],
  );

  const productLookupOptions = useMemo(
    () => {
      const map = new Map<number, ProductSelectOption>();
      allProductOptions.forEach((item) => {
        if (!map.has(Number(item.id))) {
          map.set(Number(item.id), item);
        }
      });

      return [...map.values()];
    },
    [allProductOptions],
  );

  const serviceProductOptions = useMemo(() => {
    if (serviceQueryData.length) return serviceQueryData;

    const hasServiceFlag = allProductOptions.some(
      (item) => item.isService === true,
    );

    if (!hasServiceFlag) return [];

    return allProductOptions.filter((item) => item.isService === true);
  }, [allProductOptions, serviceQueryData]);

  const goodsProductOptions = useMemo(() => {
    if (productQueryData.length) return productQueryData;

    const hasProductFlag = allProductOptions.some(
      (item) => item.isService === false,
    );

    if (!hasProductFlag) return [];

    return allProductOptions.filter((item) => item.isService === false);
  }, [allProductOptions, productQueryData]);

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
        ? serviceProductOptions
        : goodsProductOptions.map((item) => ({
            ...item,
            code: getProductCode(item),
          })),
    [goodsProductOptions, purchaseMode, serviceProductOptions],
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
    serviceOptions: serviceProductOptions,
    unitOptions: unitQuery.data ?? [],
    vatRateOptions: vatRateQuery.data ?? [],
  };
};
