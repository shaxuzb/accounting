import { Form, type FormProps, Input } from "antd";
import { getIn, type FormikProps } from "formik";
import { useTranslation } from "react-i18next";

interface InputProps<T extends object> {
  label?: string;
  formik: FormikProps<T>;
  fieldName: string;
  disabled?: boolean;
}

const InputText = <T extends object>({
  label = "",
  formik,
  fieldName = "",
  disabled = false,
}: InputProps<T>) => {
  const { t } = useTranslation();
  const fieldValue = getIn(formik.values, fieldName) as
    | string
    | number
    | null
    | undefined;
  const fieldError = getIn(formik.errors, fieldName);
  const fieldTouched = getIn(formik.touched, fieldName);
  return (
    <Form.Item<FormProps>
      className="flex flex-col"
      label={label === "" ? false : t(label)}
      validateStatus={
        fieldTouched && fieldError ? "error" : ""
      }
      help={fieldTouched && fieldError ? String(fieldError) : undefined}
      rules={[{ required: true, message: "Please input your password!" }]}
    >
      <Input
        value={fieldValue ?? ""}
        onChange={(event) => {
          const value = event.target.value;
          formik.setFieldValue(fieldName, value, true);
        }}
        name={fieldName}
        placeholder={t(label)}
        disabled={disabled}
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

export default InputText;
