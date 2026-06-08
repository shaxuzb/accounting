import { type LoginPayload } from "@/services/authService";
import { Form, type FormProps, Input } from "antd";
import { type FormikProps } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";

interface inputProps {
  label?: string;
  formik: FormikProps<LoginPayload>
  fieldName: string;
  disabled?: boolean;
}

const InputPasword: React.FC<inputProps> = (props) => {
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
      <Input.Password
        value={formik.values[fieldName]}
        onChange={(event) => {
          let value = event.target.value;
          formik.setFieldValue(fieldName, value, true);
        }}
        name={fieldName}
        type="text"
        placeholder={t(label)}
        className={`${disabled ? "disabled" : ""}`}
        style={{
          backgroundColor: "transparent",
          height: "38px",
          padding: "0px 10px",
        }}
      />
    </Form.Item>
  );
};

export default InputPasword;
