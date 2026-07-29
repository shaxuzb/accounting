import { $axiosPrivate } from "@/services/AxiosService";
import { getLocalizedLabel } from "@/shared/utils/localizedLabel";
import { useAppSelector } from "@/store/hooks";
import { useQuery } from "@tanstack/react-query";
import { Select } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

export interface SelectFilterOption {
  value: string | number;
  label: string;
}

interface SelectFilterProps {
  /** URL query parametri nomi: periodId, statusId, paymentKind ... */
  paramKey: string;
  placeholder?: string;
  /** Qat'iy ro'yxat (enum) */
  options?: readonly SelectFilterOption[];
  /** Yoki backend selectlist manzili */
  path?: string;
  queryParams?: Record<string, unknown>;
  /** Optionlarni backenddan olishda label maydoni */
  labelKey?: string;
  width?: number;
  allowClear?: boolean;
  disabled?: boolean;
  search?: boolean;
  onChanged?: (value: string | null) => void;
}

/**
 * Ro'yxat sahifalari uchun URL searchParams bilan ishlaydigan filter select.
 * Filter o'zgarganda pagination birinchi sahifaga qaytariladi.
 */
const SelectFilter: React.FC<SelectFilterProps> = ({
  paramKey,
  placeholder = "",
  options,
  path,
  queryParams,
  labelKey = "name",
  width = 200,
  allowClear = true,
  disabled = false,
  search = false,
  onChanged,
}) => {
  const { t } = useTranslation();
  const lang = useAppSelector((state) => state.lang.lang);
  const [searchParams, setSearchParams] = useSearchParams();

  const requestParams = React.useMemo(
    () =>
      Object.fromEntries(
        Object.entries(queryParams ?? {}).filter(
          ([, value]) => value !== undefined && value !== null && value !== "",
        ),
      ),
    [queryParams],
  );

  const { data, isFetching } = useQuery<Record<string, unknown>[]>({
    queryKey: ["selectlist", lang, path, requestParams],
    queryFn: async () => {
      const response = await $axiosPrivate.get<Record<string, unknown>[]>(
        path as string,
        { params: requestParams },
      );
      return response.data;
    },
    enabled: Boolean(path),
    staleTime: 5 * 60 * 1000,
  });

  const selectOptions = React.useMemo<SelectFilterOption[]>(() => {
    if (options) {
      return options.map((option) => ({
        value: option.value,
        label: t(option.label, { defaultValue: option.label }),
      }));
    }
    return (data ?? []).map((item) => ({
      value: item.id as number,
      label:
        labelKey === "name"
          ? getLocalizedLabel(item as { name?: string }, lang)
          : String(item[labelKey] ?? item.id),
    }));
  }, [data, labelKey, lang, options, t]);

  const currentValue = searchParams.get(paramKey);

  const handleChange = (value: string | number | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === null || value === undefined || value === "") {
      nextParams.delete(paramKey);
    } else {
      nextParams.set(paramKey, String(value));
    }
    nextParams.delete("page");
    setSearchParams(nextParams, { replace: true });
    onChanged?.(value === null || value === undefined ? null : String(value));
  };

  return (
    <Select
      value={currentValue ?? undefined}
      onChange={handleChange}
      onClear={() => handleChange(null)}
      allowClear={allowClear}
      disabled={disabled}
      loading={isFetching}
      showSearch={search}
      optionFilterProp="label"
      placeholder={placeholder ? t(placeholder) : undefined}
      options={selectOptions.map((option) => ({
        ...option,
        value: String(option.value),
      }))}
      style={{ width, height: 32 }}
      className="[&_.ant-select-selector]:h-8!"
    />
  );
};

export default SelectFilter;
