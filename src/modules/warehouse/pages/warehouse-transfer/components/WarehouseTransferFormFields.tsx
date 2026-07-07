import type { FormikProps } from "formik";
import Card from "@/components/ui/card/Card";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { WarehouseTransferForm } from "../types/form";

interface Props {
  formik: FormikProps<WarehouseTransferForm>;
  disabled?: boolean;
}

export default function WarehouseTransferFormFields({
  formik,
  disabled = false,
}: Props) {
  return (
    <Card className="p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <SelectDate
          formik={formik}
          fieldName="docDate"
          label="bank.fields.date"
          disabled={disabled}
        />
        <div />
        <SelectCustom
          formik={formik}
          fieldName="sourceWarehouseId"
          label="Manba ombor"
          path={selectListEndpoints.warehousesSelectList}
          disabled={disabled}
        />
        <SelectCustom
          formik={formik}
          fieldName="destinationWarehouseId"
          label="Qabul ombor"
          path={selectListEndpoints.warehousesSelectList}
          disabled={disabled}
        />
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
