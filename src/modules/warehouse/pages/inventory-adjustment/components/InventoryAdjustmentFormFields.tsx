import type { FormikProps } from "formik";
import { Select } from "antd";
import Card from "@/components/ui/card/Card";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { InventoryAdjustmentForm } from "../types/form";
import { useTranslation } from "react-i18next";

interface Props {
  formik: FormikProps<InventoryAdjustmentForm>;
  disabled?: boolean;
}

export default function InventoryAdjustmentFormFields({
  formik,
  disabled = false,
}: Props) {
  const { t } = useTranslation();
  const adjustmentTypeOptions = [
    { value: "Increase", label: t("warehouse.adjustment.increase") },
    { value: "Decrease", label: t("warehouse.adjustment.decrease") },
  ];

  return (
    <Card className="p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <SelectDate
          formik={formik}
          fieldName="docDate"
          label="bank.fields.date"
          disabled={disabled}
        />
        <SelectCustom
          formik={formik}
          fieldName="warehouseId"
          label="settings.entities.warehouse"
          path={selectListEndpoints.warehousesSelectList}
          disabled={disabled}
        />
        <div>
          <label className="mb-2 block text-sm font-medium">
            {t("warehouse.fields.adjustmentType")}
          </label>
          <Select
            value={formik.values.adjustmentType}
            options={adjustmentTypeOptions}
            disabled={disabled}
            onChange={(value) =>
              formik.setFieldValue("adjustmentType", value, true)
            }
            className="w-full"
          />
        </div>
        <div className="md:col-span-2">
          <InputText
            formik={formik}
            fieldName="comment"
            label="bank.fields.comment"
            disabled={disabled}
          />
        </div>
      </div>
    </Card>
  );
}
