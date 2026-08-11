import Card from "@/components/ui/card/Card";
import CounterpartySelect from "@/components/fields/CounterpartySelect";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import {
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import {
  saleDocumentAccountRoleCodes,
} from "../../sale/constants/documentAccount";
import { retailSaleDocumentTypeIds } from "../constants/endpoints";
import type { RetailSaleFormValues } from "../types/form";

interface Props {
  formik: FormikProps<RetailSaleFormValues>;
  isEdit: boolean;
  documentTypeId?: number;
}

export default function RetailSaleFormFields({
  formik,
  isEdit,
  documentTypeId,
}: Props) {
  const { t } = useTranslation();

  return (
    <Card className="p-3">
      <div className="grid gap-x-3 sm:grid-cols-2 xl:grid-cols-6">
        <SelectDate
          label={t("retailSale.fields.docDate")}
          fieldName="docDate"
          formik={formik}
          required
        />
        <CounterpartySelect
          kind="client"
          label={t("retailSale.fields.customer")}
          fieldName="counterpartyId"
          formik={formik}
          clearable
          optional
        />
        <SelectCustom
          label={t("retailSale.fields.warehouse")}
          fieldName="warehouseId"
          path={selectListEndpoints.warehousesSelectList}
          formik={formik}
          required
        />
        <SelectCustom
          label={t("retailSale.fields.cashRegister")}
          fieldName="cashRegisterId"
          path={selectListEndpoints.fiscalCashRegistersSelectList}
          queryParams={{ warehouseId: formik.values.warehouseId }}
          enabled={Boolean(formik.values.warehouseId)}
          formik={formik}
          search
          required
        />
        <DocumentAccountSelect
          label={t("retailSale.fields.receivableAccount")}
          fieldName="receivableAccountId"
          formik={formik}
          search
          clearable
          optional
          documentTypeId={documentTypeId ?? retailSaleDocumentTypeIds.goods}
          documentRoleCode={saleDocumentAccountRoleCodes.customerSettlement}
          enabled={Boolean(documentTypeId)}
          disabled={!documentTypeId}
          getFirst
        />
        <DocumentAccountSelect
          label={t("retailSale.fields.vatAccount")}
          fieldName="vatAccountId"
          formik={formik}
          search
          clearable
          optional
          documentTypeId={documentTypeId ?? retailSaleDocumentTypeIds.goods}
          documentRoleCode={saleDocumentAccountRoleCodes.vat}
          enabled={Boolean(documentTypeId)}
          disabled={!documentTypeId}
          getFirst
        />
        <div className="hidden">
          <SelectCustom
            label={t("retailSale.fields.currency")}
            fieldName="currencyId"
            path={selectListEndpoints.currenciesSelectList}
            formik={formik}
            getFirst
            required
          />
        </div>
        {isEdit && (
          <SelectCustom
            label={t("retailSale.fields.state")}
            fieldName="stateId"
            path={selectListEndpoints.statesSelectList}
            formik={formik}
            required
          />
        )}
      </div>
    </Card>
  );
}
