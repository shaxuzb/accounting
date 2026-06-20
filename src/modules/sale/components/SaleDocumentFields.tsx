import type { FormikProps } from "formik";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { SaleDocForm } from "../types/type";

interface SaleDocumentFieldsProps {
  formik: FormikProps<SaleDocForm>;
}

export default function SaleDocumentFields({
  formik,
}: SaleDocumentFieldsProps) {
  return (
    <div className="grid gap-x-3 border-b border-border pb-1 sm:grid-cols-2 xl:grid-cols-4">
      <SelectDate
        label="Sana"
        fieldName="docDate"
        formik={formik}
        required
      />
      <SelectCustom
        label="Kontragent"
        fieldName="counterpartyId"
        path={selectListEndpoints.counterpartiesSelectList}
        formik={formik}
        search
        required
      />
      <SelectCustom
        label="Ombor"
        fieldName="warehouseId"
        path={selectListEndpoints.warehousesSelectList}
        formik={formik}
        required
      />
      <SelectCustom
        label="Valyuta"
        fieldName="currencyId"
        path={selectListEndpoints.currenciesSelectList}
        formik={formik}
        getFirst
        required
      />
    </div>
  );
}
