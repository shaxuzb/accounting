import { Form, type FormProps, Select } from "antd";
import { getIn, type FormikProps } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";

export interface StaticOption {
  value: string | number;
  /** i18n kalit yoki tayyor matn */
  label: string;
  /** Option ichida ko'rsatiladigan qisqa izoh (i18n kalit bo'lishi mumkin) */
  description?: string;
  disabled?: boolean;
}

type FormValues = object;

interface SelectStaticProps {
  label?: string;
  formik?: FormikProps<FormValues>;
  fieldName?: string;
  options: readonly StaticOption[];
  value?: string | number | null;
  onChange?: (value: string | number | null) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  /** Tanlangan qiymatdan keyin tozalanishi kerak bo'lgan maydonlar */
  resetFields?: string[];
  marginBottom?: string;
  standalone?: boolean;
}

/**
 * Backend selectlist emas, kod ichidagi qat'iy enum ro'yxatlari uchun select.
 * SelectCustom bilan bir xil ko'rinish va formik integratsiyasiga ega.
 */
const SelectStatic: React.FC<SelectStaticProps> = ({
  label = "",
  formik,
  fieldName = "",
  options,
  value,
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  clearable = false,
  resetFields,
  marginBottom = "mb-6",
  standalone = false,
}) => {
  const { t } = useTranslation();

  const currentValue = formik ? getIn(formik.values, fieldName) : value;
  const hasError = Boolean(
    formik &&
      getIn(formik.touched, fieldName) &&
      getIn(formik.errors, fieldName),
  );

  const handleChange = (nextValue: string | number | null) => {
    formik?.setFieldValue(fieldName, nextValue ?? null, true);
    resetFields?.forEach((field) => formik?.setFieldValue(field, null, true));
    onChange?.(nextValue ?? null);
  };

  const select = (
    <Select
      value={(currentValue ?? undefined) as string | number | undefined}
      onChange={handleChange}
      onClear={() => handleChange(null)}
      allowClear={clearable}
      disabled={disabled}
      placeholder={placeholder ? t(placeholder) : t(label)}
      style={{ backgroundColor: "transparent", height: "38px", width: "100%" }}
      options={options.map((option) => ({
        value: option.value,
        disabled: option.disabled,
        label: t(option.label, { defaultValue: option.label }),
        title: option.description
          ? t(option.description, { defaultValue: option.description })
          : undefined,
      }))}
      optionRender={(option) => {
        const source = options.find(
          (item) => String(item.value) === String(option.value),
        );
        return (
          <div className="flex flex-col">
            <span>{t(source?.label ?? "", { defaultValue: source?.label ?? "" })}</span>
            {source?.description && (
              <span className="text-xs text-secondary-text">
                {t(source.description, { defaultValue: source.description })}
              </span>
            )}
          </div>
        );
      }}
    />
  );

  if (standalone) return select;

  return (
    <Form.Item<FormProps>
      className={`flex! flex-col! ${marginBottom}`}
      label={
        label === "" ? (
          false
        ) : (
          <span>
            {t(label)} {required && <span className="text-red-500">*</span>}
          </span>
        )
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

export default SelectStatic;
