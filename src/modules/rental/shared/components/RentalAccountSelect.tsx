import SelectCustom, {
  type SelectCustomDisplayConfig,
} from "@/components/fields/SelectCustom";
import {
  chartAccountOptionLabel,
  chartAccountSelectedLabel,
} from "@/shared/constants/selectLists";
import type { FormikProps } from "formik";

interface RentalAccountSelectProps<T extends object> {
  formik: FormikProps<T>;
  fieldName: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
  marginBottom?: string;
}

const displayConfig: SelectCustomDisplayConfig = {
  optionLabel: chartAccountOptionLabel,
  selectedLabel: chartAccountSelectedLabel,
  searchFields: ["number", "code", "name"],
};

export default function RentalAccountSelect<T extends object>({
  formik,
  fieldName,
  label,
  disabled = false,
  required = false,
  marginBottom = "mb-6",
}: RentalAccountSelectProps<T>) {
  return (
    <SelectCustom
      formik={formik as FormikProps<object>}
      fieldName={fieldName}
      label={label}
      path="manuals/chart-accounts"
      required={required}
      disabled={disabled}
      search
      displayConfig={displayConfig}
      marginBottom={marginBottom}
    />
  );
}
