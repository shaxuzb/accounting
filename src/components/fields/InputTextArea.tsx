import { Form, type FormProps, Input } from "antd";
import { getIn, type FormikProps } from "formik";
import { useTranslation } from "react-i18next";

interface InputTextAreaProps<T extends object> {
  label?: string;
  formik: FormikProps<T>;
  fieldName: string;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  marginBottom?: string;
}

/** Ko'p qatorli izoh maydonlari uchun (note, comment). */
const InputTextArea = <T extends object>({
  label = "",
  formik,
  fieldName,
  disabled = false,
  rows = 2,
  maxLength,
  placeholder,
  marginBottom = "",
}: InputTextAreaProps<T>) => {
  const { t } = useTranslation();
  const fieldValue = getIn(formik.values, fieldName) as
    | string
    | null
    | undefined;
  const fieldError = getIn(formik.errors, fieldName);
  const fieldTouched = getIn(formik.touched, fieldName);

  return (
    <Form.Item<FormProps>
      className={`flex! flex-col! ${marginBottom}`}
      label={label === "" ? false : t(label)}
      validateStatus={fieldTouched && fieldError ? "error" : ""}
      help={fieldTouched && fieldError ? String(fieldError) : undefined}
    >
      <Input.TextArea
        value={fieldValue ?? ""}
        onChange={(event) =>
          formik.setFieldValue(fieldName, event.target.value, true)
        }
        name={fieldName}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        placeholder={placeholder ? t(placeholder) : t(label)}
        style={{ backgroundColor: "transparent", padding: "8px 10px" }}
      />
    </Form.Item>
  );
};

export default InputTextArea;
