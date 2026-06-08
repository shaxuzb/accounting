import type { LoginPayload } from "@/services/authService";
import { Form, type FormProps, Input } from "antd";
import { type FormikProps } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";

interface InputNumberFormaterProps {
  label?: string;
  formik: FormikProps<LoginPayload> | any;
  fieldName: string;
  disabled?: boolean;
}

const InputNumberFormat: React.FC<InputNumberFormaterProps> = (props) => {
  const { t } = useTranslation();
  const { label = "", formik, fieldName = "", disabled = false } = props;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value.split(" ").join(""))
    formik.setFieldValue(fieldName, value, true);
  };
  return (
    <Form.Item<FormProps>
      className="flex! flex-col!"
      label={label === "" ? false : t(label)}
      validateStatus={
        formik.touched[fieldName] && formik.errors[fieldName] ? "error" : ""
      }
      help={formik.touched[fieldName] && formik.errors[fieldName]}
      rules={[{ required: true, message: "Please input your password!" }]}
    >
      <NumericFormat
        value={formik.values[fieldName]?.toString()}
        customInput={Input}
        onChange={handleChange}
        name={fieldName}
        placeholder={t(label)}
        thousandsGroupStyle="thousand"
        decimalScale={5}
        allowLeadingZeros={false}
        fixedDecimalScale={false}
        thousandSeparator=" "
        disabled={disabled}
        style={{
          backgroundColor: "transparent",
          padding: "0px 10px",
          height: "38px",
          width: "100%",
        }}
      />
    </Form.Item>
  );
};

export default InputNumberFormat;