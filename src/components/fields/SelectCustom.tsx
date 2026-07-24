import { $axiosPrivate } from "@/services/AxiosService";
import { useAppSelector } from "@/store/hooks";
import { getLocalizedLabel } from "@/shared/utils/localizedLabel";
import { useQuery } from "@tanstack/react-query";
import { Button, Divider, Form, type FormProps, Select } from "antd";
import { type FormikProps, getIn } from "formik";
import { Plus } from "lucide-react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

type FormValues = object;

type SelectValue =
  | string
  | number
  | null
  | undefined
  | (string | number)[];

export type SelectOptionItem = Record<string, unknown> & {
  id: number;
  name?: string;
  number?: string | number;
};

export interface SelectCustomDisplayConfig {
  optionLabel?: (item: SelectOptionItem) => React.ReactNode;
  selectedLabel?: (item: SelectOptionItem) => React.ReactNode;
  searchFields?: readonly string[];
}

interface SelectCustomProps {
  label?: string;
  formik?: FormikProps<FormValues>;
  fieldName?: string;
  value?: SelectValue;
  autoSelectValue?: string | number | null;
  autoSelectKeys?: string[];
  refetchSync?: string;
  queryParams?: Record<string, unknown>;
  getFieldName?: string | null;
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  path: string;
  enabled?: boolean;
  search?: boolean;
  disabled?: boolean;
  mode?: "multiple" | "tags";
  dinamicLabel?: string;
  displayConfig?: SelectCustomDisplayConfig;
  /** @deprecated Yangi kodda displayConfig.optionLabel ishlating. */
  optionLabel?: (item: SelectOptionItem) => React.ReactNode;
  /** @deprecated Yangi kodda displayConfig.selectedLabel ishlating. */
  selectedLabel?: (item: SelectOptionItem) => React.ReactNode;
  clearable?: boolean;
  disabledValue?: string | number | null;
  getFirst?: boolean;
  getFirstOnlyWhenSingle?: boolean;
  marginBottom?: string;
  addOption?: {
    bool: boolean;
    permissionCode: string;
    onClick: () => void;
  };
  getFieldNames?: string[] | null;
  getCustomValue?: number | string;
  isOrganizationId?: boolean;
  isPossibleBorrow?: boolean;
  allowedIds?: (number | string)[];
  onChange?: (value: unknown) => void;
}

const normalizeText = (text: unknown): string =>
  String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const toSearchText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) return value.map(toSearchText).join(" ");
  return "";
};

const defaultSearchFields = [
  "name",
  "fullName",
  "shortName",
  "inn",
  "number",
] as const;

const SelectCustom: React.FC<SelectCustomProps> = (props) => {
  const { t } = useTranslation();
  const lang = useAppSelector((state) => state.lang.lang);
  const user = useAppSelector((state) => state.auth?.user);
  const {
    label = "",
    formik,
    fieldName = "",
    required = false,
    queryParams,
    search = false,
    optional = false,
    readOnly = false,
    clearable = false,
    dinamicLabel = "name",
    displayConfig,
    optionLabel: legacyOptionLabel,
    selectedLabel: legacySelectedLabel,
    getCustomValue,
    placeholder = "",
    disabledValue = null,
    isPossibleBorrow = false,
    getFieldName = null,
    getFieldNames = null,
    marginBottom = "mb-6",
    refetchSync,
    getFirst = false,
    getFirstOnlyWhenSingle = false,
    path,
    enabled = true,
    isOrganizationId = false,
    addOption = {
      bool: false,
      permissionCode: "",
      onClick: () => {},
    },
    disabled = false,
    allowedIds,
    mode,
    onChange,
    value,
    autoSelectValue = null,
    autoSelectKeys = ["id"],
  } = props;

  const optionLabel = legacyOptionLabel ?? displayConfig?.optionLabel;
  const selectedLabel = legacySelectedLabel ?? displayConfig?.selectedLabel;
  const searchFields = displayConfig?.searchFields ?? defaultSearchFields;

  const requestParams = React.useMemo(
    () =>
      Object.fromEntries(
        Object.entries({
          ...(isOrganizationId && {}),
          ...(isPossibleBorrow && { isPossibleBorrow: true }),
          ...(queryParams ?? {}),
        }).filter(
          ([, value]) =>
            value !== undefined &&
            value !== null &&
            !(typeof value === "string" && value === ""),
        ),
      ),
    [isOrganizationId, isPossibleBorrow, queryParams],
  );

  //   const [searchValue, setSearchValue] = useState<string>("");
  const { data, isFetching, isLoading, isSuccess } = useQuery<
    SelectOptionItem[]
  >({
    queryKey: ["selectlist", lang, path, refetchSync, requestParams],
    queryFn: async () => {
      const response = await $axiosPrivate.get<SelectOptionItem[]>(path, {
        params: requestParams,
      });
      return response.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
  });
  const selectOptions = React.useMemo(() => {
    const options = data ?? [];
    if (!allowedIds?.length) return options;
    const allowedSet = new Set(allowedIds.map(String));
    return options.filter((item) => allowedSet.has(String(item.id)));
  }, [allowedIds, data]);

  const getOptionLabel = React.useCallback(
    (item: SelectOptionItem) =>
      optionLabel?.(item) ??
      (dinamicLabel === "name"
        ? getLocalizedLabel(item, lang)
        : (item[dinamicLabel] as React.ReactNode)),
    [dinamicLabel, lang, optionLabel],
  );

  const getSelectedLabel = React.useCallback(
    (item: SelectOptionItem) => selectedLabel?.(item) ?? getOptionLabel(item),
    [getOptionLabel, selectedLabel],
  );

  const searchConfig = React.useMemo(() => {
    if (!search) return undefined;

    return {
      optionFilterProp: "label",
      filterOption: (input: string, option?: SelectOptionItem) => {
        const searchableText = [
          option?.label,
          option?.id,
          option?.[dinamicLabel],
          ...searchFields.map((field) => option?.[field]),
        ]
          .map(toSearchText)
          .join(" ");

        return normalizeText(searchableText).includes(normalizeText(input));
      },
    };
  }, [dinamicLabel, search, searchFields]);

  const currentValue = formik ? getIn(formik.values, fieldName) : value;
  const hasError = Boolean(
    formik &&
      getIn(formik.touched, fieldName) &&
      getIn(formik.errors, fieldName),
  );
  useEffect(() => {
    const normalizedAutoSelectValue = String(autoSelectValue ?? "")
      .replace(/\s/g, "")
      .trim();
    const autoSelectedOption = normalizedAutoSelectValue
      ? selectOptions.find((option) =>
          autoSelectKeys.some(
            (key) =>
              String(option[key] ?? "")
                .replace(/\s/g, "")
                .trim() === normalizedAutoSelectValue,
          ),
        )
      : undefined;
    const firstOption = autoSelectedOption ?? selectOptions[0];
    const shouldAutoSelect = autoSelectedOption
        ? true
      : formik
        ? selectOptions.length < 2 || getFirst
        : getFirstOnlyWhenSingle
          ? selectOptions.length === 1
          : getFirst;

    if (
      enabled &&
      isSuccess &&
      shouldAutoSelect &&
      firstOption &&
      mode !== "multiple" &&
      mode !== "tags" &&
      (currentValue === null || currentValue === undefined)
    ) {
      const firstValue = firstOption.id;
      formik?.setFieldValue(fieldName, firstValue, true);
      if (!formik) onChange?.(firstValue);
      if (
        formik &&
        getCustomValue &&
        !Array.isArray(firstOption) &&
        getCustomValue in firstOption
      ) {
        formik.setFieldValue(
          `${String(getCustomValue)}Static`,
          firstOption[getCustomValue],
          true,
        );
      }
      if (formik && getFieldName) {
        formik.setFieldValue(
          getFieldName,
          getOptionLabel(firstOption),
          true,
        );
      }
      if (formik && getFieldNames) {
        getFieldNames.forEach((item) => {
          formik.setFieldValue(item, firstOption[item], true);
        });
      }
    }
  }, [
    isSuccess,
    enabled,
    selectOptions,
    formik,
    fieldName,
    mode,
    getFieldName,
    getFieldNames,
    dinamicLabel,
    optionLabel,
    selectedLabel,
    getCustomValue,
    getOptionLabel,
    getFirst,
    getFirstOnlyWhenSingle,
    currentValue,
    onChange,
    autoSelectValue,
    autoSelectKeys,
  ]);
  return (
    <Form.Item<FormProps>
      className={`flex! flex-col! ${marginBottom}`}
      label={
        label === "" ? (
          false
        ) : (
          <span>
            {t(label)} {required && <span className="text-red-500">*</span>}{" "}
            {optional && <span>({t("ixtiyoriy")})</span>}
          </span>
        )
      }
      validateStatus={hasError ? "error" : ""}
      help={
        hasError && formik
          ? (getIn(formik.errors, fieldName) as React.ReactNode)
          : undefined
      }
      rules={[{ required: true, message: "Please input your password!" }]}
    >
      <Select
        value={currentValue as SelectValue}
        mode={mode}
        open={readOnly ? false : undefined}
        loading={isFetching || isLoading}
        showSearch={searchConfig}
        allowClear={clearable}
        // searchValue={searchValue}
        // onSearch={(value) => {
        //   setSearchValue(value);
        // }}
        onClear={() => {
          const clearedValue = mode === "multiple" || mode === "tags" ? [] : null;
          formik?.setFieldValue(fieldName, clearedValue, true);
          onChange?.(clearedValue);
        }}
        // optionFilterProp="children"
        // filterOption={(input, option) => {
        //   const normalizedInput = normalizeText(input);
        //   const normalizedOption = normalizeText(option?.label);
        //   return normalizedOption.includes(normalizedInput);
        // }}
        onChange={(value, option) => {
          if (mode === "multiple" || mode === "tags") {
            formik?.setFieldValue(fieldName, value, true);
            onChange?.(value);
            return;
          }

          const nextValue = formik ? value : value ?? null;

          if (
            formik &&
            getFieldName &&
            option &&
            !Array.isArray(option) &&
            "label" in option
          ) {
            formik.setFieldValue(getFieldName, option.label, true);
          }
          if (formik && getFieldNames) {
            getFieldNames.forEach((item) => {
              if (option && !Array.isArray(option) && item in option) {
                formik.setFieldValue(item, option[item], true);
              }
            });
          }
          if (
            formik &&
            getCustomValue &&
            option &&
            !Array.isArray(option) &&
            getCustomValue in option
          ) {
            formik.setFieldValue(
              `${String(getCustomValue)}Static`,
              option[getCustomValue],
              true,
            );
          }
          if (
            formik &&
            getIn(formik.values, "regionId") &&
            fieldName === "regionId"
          ) {
            formik.setFieldValue("districtId", null, true);
          }
          formik?.setFieldValue(fieldName, nextValue, true);
          onChange?.(nextValue);
        }}
        popupRender={
          addOption.bool &&
          user?.user?.permissions?.includes(addOption.permissionCode)
            ? (menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: "4px 0" }} />
                  <div>
                    <Button
                      type="primary"
                      size="small"
                      className="flex px-2! py-3! w-full"
                      onClick={addOption.onClick}
                    >
                      <Plus className="size-4.5" />
                      {t("common.add")}
                    </Button>
                  </div>
                </>
              )
            : undefined
        }
        placeholder={placeholder ? t(placeholder) : ""}
        options={selectOptions.map((item) => ({
          ...item,
          value: item.id,
          label: getOptionLabel(item),
          disabled: disabledValue !== null ? item.id === disabledValue : false,
        }))}
        disabled={disabled}
        style={{
          backgroundColor: "transparent",
          height: mode === "multiple" ? "" : "38px",
          marginBottom: "0px",
        }}
        labelRender={(option) => {
          const item = selectOptions.find(
            (candidate) => String(candidate.id) === String(option.value),
          );
          return item ? getSelectedLabel(item) : option.label;
        }}
        optionRender={
          optionLabel ? (option) => getOptionLabel(option.data) : undefined
        }
      />
    </Form.Item>
  );
};

export default SelectCustom;
