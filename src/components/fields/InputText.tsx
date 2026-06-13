import { type LoginPayload } from "@/services/authService";
import { Form, type FormProps, Input } from "antd";
import { type FormikProps } from "formik";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";

interface inputProps {
  label?: string;
  formik: FormikProps<LoginPayload> | any;
  fieldName: string;
  disabled?: boolean;
}

const InputText: React.FC<inputProps> = (props) => {
  const { t } = useTranslation();
  const { label = "", formik, fieldName = "", disabled = false } = props;
  return (
    <Form.Item<FormProps>
      className="flex flex-col"
      label={label === "" ? false : t(label)}
      validateStatus={
        formik.touched[fieldName] && formik.errors[fieldName] ? "error" : ""
      }
      help={formik.touched[fieldName] && formik.errors[fieldName]}
      rules={[{ required: true, message: "Please input your password!" }]}
    >
      <Input
        value={formik.values[fieldName]}
        onChange={(event) => {
          let value = event.target.value;
          formik.setFieldValue(fieldName, value, true);
        }}
        name={fieldName}
        placeholder={t(label)}
        className={`${disabled ? "disabled" : ""}`}
        style={{
          backgroundColor: "transparent",
          padding: "0px 10px",
          height: "38px",
        }}
      />
    </Form.Item>
  );
};

export default memo(InputText);
