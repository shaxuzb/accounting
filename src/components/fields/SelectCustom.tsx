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

type SelectOptionItem = Record<string, unknown> & {
  id: number;
  name?: string;
  number?: string | number;
};

interface SelectCustomProps {
  label?: string;
  formik: FormikProps<FormValues>;
  fieldName: string;
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
  optionLabel?: (item: SelectOptionItem) => React.ReactNode;
  selectedLabel?: (item: SelectOptionItem) => React.ReactNode;
  clearable?: boolean;
  disabledValue?: string | number | null;
  getFirst?: boolean;
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
    optionLabel,
    selectedLabel,
    getCustomValue,
    placeholder = "",
    disabledValue = null,
    isPossibleBorrow = false,
    getFieldName = null,
    getFieldNames = null,
    marginBottom = "mb-6",
    refetchSync,
    getFirst = false,
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
  } = props;

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
          option?.name,
          option?.number,
          option?.[dinamicLabel],
        ]
          .map(toSearchText)
          .join(" ");

        return normalizeText(searchableText).includes(normalizeText(input));
      },
    };
  }, [dinamicLabel, search]);

  const hasError = !!(
    getIn(formik.touched, fieldName) && getIn(formik.errors, fieldName)
  );
  useEffect(() => {
    if (
      isSuccess &&
      (selectOptions?.length < 2 || getFirst) &&
      mode !== "multiple" &&
      mode !== "tags" &&
      getIn(formik.values, fieldName) === null
    ) {
      formik.setFieldValue(fieldName, selectOptions[0]?.id, true);
      if (
        getCustomValue &&
        selectOptions[0] &&
        !Array.isArray(selectOptions[0]) &&
        getCustomValue in selectOptions[0]
      ) {
        formik.setFieldValue(
          `${String(getCustomValue)}Static`,
          selectOptions[0][getCustomValue],
          true,
        );
      }
      if (getFieldName) {
        formik.setFieldValue(
          getFieldName,
          getOptionLabel(selectOptions[0]),
          true,
        );
      }
      if (getFieldNames) {
        getFieldNames.forEach((item) => {
          formik.setFieldValue(item, selectOptions[0]?.[item], true);
        });
      }
    }
  }, [
    isSuccess,
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
        hasError
          ? (getIn(formik.errors, fieldName) as React.ReactNode)
          : undefined
      }
      rules={[{ required: true, message: "Please input your password!" }]}
    >
      <Select
        value={
          getIn(formik.values, fieldName) as
            | string
            | number
            | null
            | undefined
            | (string | number)[]
        }
        mode={mode}
        open={readOnly ? false : undefined}
        loading={isFetching || isLoading}
        showSearch={searchConfig}
        allowClear={clearable}
        // searchValue={searchValue}
        // onSearch={(value) => {
        //   setSearchValue(value);
        // }}
        onClear={() =>
          formik.setFieldValue(
            fieldName,
            mode === "multiple" || mode === "tags" ? [] : null,
            true,
          )
        }
        // optionFilterProp="children"
        // filterOption={(input, option) => {
        //   const normalizedInput = normalizeText(input);
        //   const normalizedOption = normalizeText(option?.label);
        //   return normalizedOption.includes(normalizedInput);
        // }}
        onChange={(value, option) => {
          if (mode === "multiple" || mode === "tags") {
            formik.setFieldValue(fieldName, value, true);
            onChange?.(value);
            return;
          }

          if (
            getFieldName &&
            option &&
            !Array.isArray(option) &&
            "label" in option
          ) {
            formik.setFieldValue(getFieldName, option.label, true);
          }
          if (getFieldNames) {
            getFieldNames.forEach((item) => {
              if (option && !Array.isArray(option) && item in option) {
                formik.setFieldValue(item, option[item], true);
              }
            });
          }
          if (
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
          if (getIn(formik.values, "regionId") && fieldName === "regionId") {
            formik.setFieldValue("districtId", null, true);
          }
          formik.setFieldValue(fieldName, value, true);
          onChange?.(value);
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
