import { Form, type FormProps, Input } from "antd";
import { getIn } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";

interface InputNumberFormaterProps {
  label?: string;
  formik?: {
    values: object;
    touched: object;
    errors: object;
    setFieldValue: (
      field: string,
      value: unknown,
      shouldValidate?: boolean,
    ) => unknown;
  };
  fieldName?: string;
  disabled?: boolean;
  value?: number | null;
  onValueChange?: (value: number | null) => void;
  onPressEnter?: () => void;
  min?: number;
  max?: number;
  precision?: number;
  placeholder?: string;
  standalone?: boolean;
  height?: number;
}

const InputNumberFormat: React.FC<InputNumberFormaterProps> = (props) => {
  const { t } = useTranslation();
  const {
    label = "",
    formik,
    fieldName = "",
    disabled = false,
    value,
    onValueChange,
    onPressEnter,
    min,
    max,
    precision = 5,
    placeholder,
    standalone = false,
    height = 38,
  } = props;
  const inputValue = onValueChange ? value : getIn(formik?.values, fieldName);
  const hasError = Boolean(
    getIn(formik?.touched, fieldName) && getIn(formik?.errors, fieldName),
  );
  const input = (
    <NumericFormat
      value={inputValue ?? ""}
      customInput={Input}
      onValueChange={(values) => {
        const nextValue = values.value === "" ? null : values.floatValue ?? null;
        if (onValueChange) {
          onValueChange(nextValue);
          return;
        }
        formik?.setFieldValue(fieldName, nextValue, true);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
          onPressEnter?.();
        }
      }}
      isAllowed={(values) => {
        if (values.floatValue === undefined) return true;
        if (min !== undefined && values.floatValue < min) return false;
        if (max !== undefined && values.floatValue > max) return false;
        return true;
      }}
      name={fieldName}
      placeholder={placeholder ?? t(label)}
      thousandsGroupStyle="thousand"
      decimalScale={precision}
      allowNegative={min === undefined || min < 0}
      allowLeadingZeros={false}
      fixedDecimalScale={false}
      thousandSeparator=" "
      disabled={disabled}
      style={{
        backgroundColor: "transparent",
        padding: "0px 10px",
        height: `${height}px`,
        width: "100%",
      }}
    />
  );

  if (standalone) {
    return input;
  }

  return (
    <Form.Item<FormProps>
      className="flex! flex-col!"
      label={label === "" ? false : t(label)}
      validateStatus={hasError ? "error" : ""}
      help={hasError ? String(getIn(formik?.errors, fieldName)) : undefined}
      rules={[{ required: true, message: "Please input your password!" }]}
    >
      {input}
    </Form.Item>
  );
};

export default InputNumberFormat;
