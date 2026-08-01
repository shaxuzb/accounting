import { Form, type FormProps, Input } from "antd";
import { getIn, type FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import { PatternFormat } from "react-number-format";
interface InputPhoneNumberProps<T extends object> {
  label?: string;
  formik: FormikProps<T>;
  fieldName: string;
  disabled?: boolean;
}

const InputPhoneNumber = <T extends object>({
  label = "",
  formik,
  fieldName = "",
  disabled = false,
}: InputPhoneNumberProps<T>) => {
  const { t } = useTranslation();
  const fieldValue = getIn(formik.values, fieldName) as string | null | undefined;
  const fieldError = getIn(formik.errors, fieldName);
  const fieldTouched = getIn(formik.touched, fieldName);

  return (
    <Form.Item<FormProps>
      className="flex! flex-col!"
      label={label === "" ? false : t(label)}
      validateStatus={
        fieldTouched && fieldError ? "error" : ""
      }
      help={fieldTouched && fieldError ? String(fieldError) : undefined}
    >
      <PatternFormat
        format="+998 ## ###-##-##"
        customInput={Input}
        value={fieldValue ?? ""}
        onChange={(event) => {
          const value = event.target.value;
          formik.setFieldValue(fieldName, value, true);
        }}
        name={fieldName}
        placeholder={"+998 ## ###-##-##"}
        className={`${disabled ? "disabled" : ""} mono`}
        style={{
          backgroundColor: "transparent",
          padding: "0px 10px",
          height: "38px",
        }}
      />
    </Form.Item>
  );
};

export default InputPhoneNumber;
