import { useState } from "react";
import type { FormikProps } from "formik";
import dayjs from "dayjs";
import { useQueryClient } from "@tanstack/react-query";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import SwitchField from "@/components/fields/SwitchField";
import CounterpartySelect from "@/components/fields/CounterpartySelect";
import CounterpartyAddEditPage from "@/modules/settings/pages/counterparty/screens/CounterpartyAddEditPage";
import ContractAddEditPage from "@/modules/contract/screens/ContractAddEditPage";
import {
  filterIds,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { invalidateSelectListQuery } from "@/shared/utils/invalidateSelectListQuery";
import { counterpartyPermissions } from "@/modules/settings/pages/counterparty/constants/permissions";
import { contractPermissions } from "@/modules/contract/constants/permissions";
import type { Contract } from "@/modules/contract/types/type";
import { formatDateWithOutTime } from "@/utils/helpers";
import type { SaleDocForm } from "../types/form";
import { Col, Row } from "antd";
import Card from "@/components/ui/card/Card";
import {
  saleDocumentAccountRoleCodes,
  saleDocumentTypeId,
} from "../constants/documentAccount";
import { useTranslation } from "react-i18next";

interface Props {
  formik: FormikProps<SaleDocForm>;
  isEdit: boolean;
}

export default function SaleDocumentFormFields({ formik, isEdit }: Props) {
  const { t } = useTranslation();
  const [counterpartyCreateOpen, setCounterpartyCreateOpen] = useState(false);
  const [contractCreateOpen, setContractCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const clearContract = () => {
    if (formik.values.contractId !== null) {
      formik.setFieldValue("contractId", null, false);
    }
  };

  const handleContractCreated = (contract: Contract) => {
    formik.setFieldValue("contractId", contract.id, true);
    invalidateSelectListQuery(
      queryClient,
      "contractId",
      selectListEndpoints.contractsSelectList,
    );
  };

  return (
    // <div className="grid gap-x-3 border-b border-border pb-1 sm:grid-cols-2 xl:grid-cols-4">
    <Card className="p-3" >
      <Row gutter={[16, 0]}>
        <Col span={4}>
          <SelectDate
            label={t("bank.fields.date")}
            fieldName="docDate"
            formik={formik}
            onChange={clearContract}
            required
          />
        </Col>
        <Col span={4}>
          <CounterpartySelect
            kind="client"
            label={t("sale.fields.customer")}
            fieldName="counterpartyId"
            formik={formik}
            onChange={clearContract}
            required
            addOption={{
              bool: true,
              permissionCode: counterpartyPermissions.create,
              onClick: () => {
                setCounterpartyCreateOpen(true);
              },
            }}
          />
        </Col>
        <Col span={4}>
          <SelectCustom
            path={selectListEndpoints.contractsSelectList}
            queryParams={{
              choosedDate: dayjs(formik.values.docDate).format(
                formatDateWithOutTime,
              ),
              [filterIds.counterparty]: formik.values.counterpartyId,
            }}
            label={t("purchase.fields.contract")}
            fieldName="contractId"
            formik={formik}
            enabled={Boolean(formik.values.counterpartyId)}
            disabled={!formik.values.counterpartyId}
            required
            addOption={{
              bool: true,
              permissionCode: contractPermissions.create,
              onClick: () => {
                setContractCreateOpen(true);
              },
            }}
          />
        </Col>
        <Col span={4}>
          <SelectCustom
            label={t("menu.warehouse")}
            fieldName="warehouseId"
            path={selectListEndpoints.warehousesSelectList}
            formik={formik}
            required
          />
        </Col>
        <Col span={4}>
          <DocumentAccountSelect
            label={t("sale.fields.customerAccount")}
            fieldName="customerAccountId"
            formik={formik}
            search
            required
            documentTypeId={saleDocumentTypeId}
            documentRoleCode={
              saleDocumentAccountRoleCodes.customerSettlement
            }
            getFirst
          />
        </Col>
        <Col span={4}>
          <DocumentAccountSelect
            label={t("sale.fields.vatAccount")}
            fieldName="vatAccountId"
            formik={formik}
            search
            required
            documentTypeId={saleDocumentTypeId}
            documentRoleCode={saleDocumentAccountRoleCodes.vat}
            getFirst
          />
        </Col>
        <Col span={4}>
          <SwitchField
            label="app.fields.priceIncludesVat"
            description="app.fields.priceIncludesVatHint"
            fieldName="priceIncludesVat"
            formik={formik}
            marginBottom="mb-0"
          />
        </Col>
        <div className="hidden">
          <SelectCustom
            label={t("app.fields.currency")}
            fieldName="currencyId"
            path={selectListEndpoints.currenciesSelectList}
            formik={formik}
            getFirst
            required
          />
        </div>
        {isEdit && (
          <SelectCustom
            label={t("settings.fields.status")}
            fieldName="stateId"
            path={selectListEndpoints.statesSelectList}
            formik={formik}
            required
          />
        )}
        <CounterpartyAddEditPage
          open={counterpartyCreateOpen}
          onClose={() => {
            setCounterpartyCreateOpen(false);
            invalidateSelectListQuery(
              queryClient,
              "counterpartyId",
              selectListEndpoints.counterpartiesSelectList,
            );
          }}
        />
        <ContractAddEditPage
          open={contractCreateOpen}
          contractTypeId={2}
          initialCounterpartyId={formik.values.counterpartyId}
          onCreated={handleContractCreated}
          onClose={() => {
            setContractCreateOpen(false);
          }}
        />
      </Row>
    </Card>
    // </div>
  );
}
