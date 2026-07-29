import { Form, Switch } from "antd";
import { getIn, type FormikProps } from "formik";
import { useTranslation } from "react-i18next";

interface SwitchFieldProps<T extends object> {
  label?: string;
  description?: string;
  formik: FormikProps<T>;
  fieldName: string;
  disabled?: boolean;
  marginBottom?: string;
}

/** Boolean sozlamalar uchun (isMandatory kabi). */
const SwitchField = <T extends object>({
  label = "",
  description,
  formik,
  fieldName,
  disabled = false,
  marginBottom = "mb-6",
}: SwitchFieldProps<T>) => {
  const { t } = useTranslation();
  const fieldValue = Boolean(getIn(formik.values, fieldName));

  return (
    <Form.Item className={`flex! flex-col! ${marginBottom}`} label={false}>
      <div className="flex min-h-[38px] items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
        <div className="min-w-0">
          {label && <div className="text-sm font-medium text-text">{t(label)}</div>}
          {description && (
            <div className="text-xs text-secondary-text">{t(description)}</div>
          )}
        </div>
        <Switch
          checked={fieldValue}
          disabled={disabled}
          onChange={(checked) => formik.setFieldValue(fieldName, checked, true)}
        />
      </div>
    </Form.Item>
  );
};

export default SwitchField;
