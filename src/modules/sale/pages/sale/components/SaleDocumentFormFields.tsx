import type { FormikProps } from "formik";
import dayjs from "dayjs";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import {
  filterIds,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { formatDateWithOutTime } from "@/utils/helpers";
import type { SaleDocForm } from "../types/form";

interface Props {
  formik: FormikProps<SaleDocForm>;
  isEdit: boolean;
}

export default function SaleDocumentFormFields({ formik, isEdit }: Props) {
  return (
    <div className="grid gap-x-3 border-b border-border pb-1 sm:grid-cols-2 xl:grid-cols-4">
      <SelectDate
        label="Sana"
        fieldName="docDate"
        formik={formik}
        required
      />
      <SelectCustom
        label="Mijoz"
        fieldName="counterpartyId"
        path={selectListEndpoints.counterpartiesSelectList}
        formik={formik}
        search
        required
      />
      <SelectCustom
        path={
          selectListEndpoints.contractsSelectList +
          `?choosedDate=${dayjs(formik.values.docDate).format(formatDateWithOutTime)}${formik.values.counterpartyId ? `&${filterIds.counterparty}=${formik.values.counterpartyId}` : ""}`
        }
        label="Shartnoma"
        fieldName="contractId"
        formik={formik}
        refetchSync={`${formik.values.counterpartyId}${formik.values.docDate}`}
        required
      />
      <SelectCustom
        label="Ombor"
        fieldName="warehouseId"
        path={selectListEndpoints.warehousesSelectList}
        formik={formik}
        required
      />
      <div className="hidden">
        <SelectCustom
          label="Valyuta"
          fieldName="currencyId"
          path={selectListEndpoints.currenciesSelectList}
          formik={formik}
          getFirst
          required
        />
      </div>
      {isEdit && (
        <SelectCustom
          label="Holat"
          fieldName="stateId"
          path={selectListEndpoints.statesSelectList}
          formik={formik}
          required
        />
      )}
    </div>
  );
}
