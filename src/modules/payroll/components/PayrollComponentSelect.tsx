import { Form, Select, Tag } from "antd";
import { getIn, type FormikProps } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";
import { usePayrollComponentLookup } from "../hooks/usePayrollComponentLookup";
import {
  componentTypeColor,
  type PayrollComponentType,
} from "../constants/options";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik?: FormikProps<any>;
  fieldName?: string;
  label?: string;
  value?: number | null;
  onChange?: (value: number | null, componentType?: string | null) => void;
  componentType?: string;
  disabled?: boolean;
  required?: boolean;
  standalone?: boolean;
  marginBottom?: string;
}

/** Hisoblash komponentini tanlash (turi rangli belgi bilan ko'rsatiladi). */
const PayrollComponentSelect: React.FC<Props> = ({
  formik,
  fieldName = "",
  label = "payroll.fields.component",
  value,
  onChange,
  componentType,
  disabled = false,
  required = false,
  standalone = false,
  marginBottom = "mb-4",
}) => {
  const { t } = useTranslation();
  const { data, isFetching } = usePayrollComponentLookup(componentType);

  const currentValue = formik ? getIn(formik.values, fieldName) : value;
  const hasError = Boolean(
    formik &&
      getIn(formik.touched, fieldName) &&
      getIn(formik.errors, fieldName),
  );

  const options = React.useMemo(
    () =>
      (data ?? []).map((component) => ({
        value: component.id,
        label: component.name,
        code: component.code,
        componentType: component.componentType,
        calculationMethod: component.calculationMethod,
        searchText: `${component.name} ${component.code}`.toLowerCase(),
      })),
    [data],
  );

  const handleChange = (nextValue: number | null) => {
    const selected = options.find((option) => option.value === nextValue);
    formik?.setFieldValue(fieldName, nextValue ?? null, true);
    onChange?.(nextValue ?? null, selected?.componentType ?? null);
  };

  const select = (
    <Select
      value={(currentValue ?? undefined) as number | undefined}
      onChange={handleChange}
      loading={isFetching}
      disabled={disabled}
      showSearch
      optionFilterProp="label"
      filterOption={(input, option) =>
        String((option as { searchText?: string })?.searchText ?? "").includes(
          input.toLowerCase(),
        )
      }
      placeholder={t("payroll.placeholders.selectComponent")}
      options={options}
      optionRender={(option) => {
        const item = option.data as {
          label: string;
          code: string;
          componentType: PayrollComponentType;
        };
        return (
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm">
              <span className="text-secondary-text">{item.code}</span>{" "}
              {item.label}
            </span>
            <Tag
              className="m-0! shrink-0"
              color={componentTypeColor[item.componentType] ?? "default"}
            >
              {t(`payroll.enums.componentType.${item.componentType}`, {
                defaultValue: item.componentType,
              })}
            </Tag>
          </div>
        );
      }}
      style={{ width: "100%", height: 38, backgroundColor: "transparent" }}
    />
  );

  if (standalone) return select;

  return (
    <Form.Item
      className={`flex! flex-col! ${marginBottom}`}
      label={
        <span>
          {t(label)} {required && <span className="text-red-500">*</span>}
        </span>
      }
      validateStatus={hasError ? "error" : ""}
      help={
        hasError && formik
          ? (getIn(formik.errors, fieldName) as React.ReactNode)
          : undefined
      }
    >
      {select}
    </Form.Item>
  );
};

export default PayrollComponentSelect;
