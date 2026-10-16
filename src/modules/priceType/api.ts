import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { getJson } from "@/modules/accountings/services/request";

export const priceTypePermissions = {
  view: "PRICE_TYPE_VIEW",
  create: "PRICE_TYPE_CREATE",
  delete: "PRICE_TYPE_DELETE",
} as const;

export const priceSettingPermissions = {
  view: "PRICE_SETTING_VIEW",
  create: "PRICE_SETTING_CREATE",
  delete: "PRICE_SETTING_DELETE",
} as const;

export const priceSettingPath = "/main/warehouses/price-settings";

/** 1C «Типы цен номенклатуры». */
export interface PriceType {
  id: number;
  name: string;
  currencyId: number;
  currencyCode?: string | null;
  priceIncludesVat: boolean;
  roundingPrecision?: number | null;
  roundingUp: boolean;
  isDefault: boolean;
}

export type PriceTypeSave = Omit<PriceType, "id" | "currencyCode">;

export interface PriceTypePrice {
  productId: number;
  price: number;
  priceIncludesVat: boolean;
  setDate: string;
}

export interface PriceSettingListItem {
  id: number;
  docNumber: string;
  docDate: string;
  priceTypeId: number;
  priceTypeName?: string | null;
  lineCount: number;
  comment?: string | null;
}

export interface PriceSettingLine {
  id?: number | null;
  productId: number | null;
  productName?: string | null;
  unitName?: string | null;
  price: number | null;
  oldPrice?: number | null;
  purchasePrice?: number | null;
}

export interface PriceSetting {
  id: number;
  docNumber: string;
  docDate: string;
  priceTypeId: number;
  comment?: string | null;
  lines: PriceSettingLine[];
}

export interface PriceSettingSave {
  docDate: string;
  priceTypeId: number;
  comment: string | null;
  lines: { productId: number; price: number }[];
}

export interface PriceSettingFill {
  priceTypeId: number;
  date?: string;
  productGroupId?: number | null;
  purchaseDocId?: number | null;
  onlyWithPrice?: boolean;
  documentId?: number | null;
  productIds?: number[];
}

const typeBase = "/price-types";
const typeKey = ["price-types"] as const;
const settingBase = "/price-settings";
const settingKey = ["price-settings"] as const;

export const usePriceTypes = (enabled = true) =>
  useQuery({
    queryKey: typeKey,
    queryFn: () => getJson<PriceType[]>(typeBase),
    enabled,
    staleTime: 60 * 1000,
  });

/** The prices of a type on a day, in the document's currency (1C «Цены номенклатуры» on a date). */
export const usePriceTypePrices = (
  priceTypeId: number | null | undefined,
  date: string | null | undefined,
  currencyId: number | null | undefined,
) =>
  useQuery({
    queryKey: [...typeKey, priceTypeId, "prices", date, currencyId],
    queryFn: () =>
      getJson<PriceTypePrice[]>(`${typeBase}/${priceTypeId}/prices`, {
        date,
        currencyId: currencyId || undefined,
      }),
    enabled: Boolean(priceTypeId && date),
    staleTime: 30 * 1000,
    retry: false,
  });

export const useSavePriceType = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number | null; body: PriceTypeSave }) => {
      if (id) {
        await $axiosPrivate.put(`${typeBase}/${id}`, body);
        return id;
      }
      const { data } = await $axiosPrivate.post<number>(typeBase, body);
      return data;
    },
    onSuccess: () => void client.invalidateQueries({ queryKey: typeKey }),
  });
};

export const useDeletePriceType = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => $axiosPrivate.delete(`${typeBase}/${id}`),
    onSuccess: () => void client.invalidateQueries({ queryKey: typeKey }),
  });
};

export const usePriceSettings = (params: Record<string, unknown>) =>
  useQuery({
    queryKey: [...settingKey, "list", params],
    queryFn: () => getJson<PriceSettingListItem[]>(settingBase, params),
  });

export const usePriceSetting = (id: number | null) =>
  useQuery({
    queryKey: [...settingKey, id],
    queryFn: () => getJson<PriceSetting>(`${settingBase}/${id}`),
    enabled: Boolean(id),
  });

export const fillPriceSetting = async (body: PriceSettingFill) =>
  (await $axiosPrivate.post<PriceSettingLine[]>(`${settingBase}/fill`, body)).data;

export const useSavePriceSetting = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number | null; body: PriceSettingSave }) => {
      if (id) {
        await $axiosPrivate.put(`${settingBase}/${id}`, body);
        return id;
      }
      const { data } = await $axiosPrivate.post<number>(settingBase, body);
      return data;
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: settingKey });
      void client.invalidateQueries({ queryKey: typeKey });
    },
  });
};

export const useDeletePriceSetting = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => $axiosPrivate.delete(`${settingBase}/${id}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: settingKey });
      void client.invalidateQueries({ queryKey: typeKey });
    },
  });
};

/**
 * A price rounded by the type's rule (1C «Порядок округления»): to the step, always up or by the
 * arithmetic rule; no step — to the tiyin.
 */
export const roundByType = (price: number, type?: Pick<PriceType, "roundingPrecision" | "roundingUp"> | null) => {
  const step = Number(type?.roundingPrecision) || 0;
  if (step <= 0) return Math.round(price * 100) / 100;
  const units = price / step;
  // tiny float noise must not push a round price up a step
  const rounded = type?.roundingUp ? Math.ceil(Number(units.toFixed(9))) : Math.round(units);
  return Math.round(rounded * step * 100) / 100;
};
