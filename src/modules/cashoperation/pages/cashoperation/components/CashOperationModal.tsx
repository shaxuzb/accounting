import type { FormikProps } from "formik";
import { useState } from "react";
import { Col, Row } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import InputNumberFormat from "@/components/fields/InputNumber";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import CounterpartyAddEditPage from "@/modules/settings/pages/counterparty/screens/CounterpartyAddEditPage";
import { counterpartyPermissions } from "@/modules/settings/pages/counterparty/constants/permissions";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { invalidateSelectListQuery } from "@/shared/utils/invalidateSelectListQuery";
import type { CashOperationForm } from "@/modules/cashoperation/pages/cashoperation/types/form";
import {
  cashDocumentAccountRoleCodes,
  cashDocumentTypeIds,
  getCashDocumentTypeId,
} from "@/modules/cashoperation/constants/documentAccount";

interface CashOperationFormFieldsProps {
  formik: FormikProps<CashOperationForm>;
}

export default function CashOperationFormFields({
  formik,
}: CashOperationFormFieldsProps) {
  const [counterpartyCreateOpen, setCounterpartyCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const documentTypeId = getCashDocumentTypeId(formik.values.operationTypeId);
  const canUseDocumentAccounts = documentTypeId !== null;

  return (
    <>
      <Row gutter={[16, 0]}>
        <Col span={4}>
          <SelectCustom
            formik={formik}
            fieldName="operationTypeId"
            label="cash.fields.operationType"
            path={selectListEndpoints.operationTypes}
            onChange={(value) => {
              if (Number(value) === Number(formik.values.operationTypeId))
                return;

              formik.setFieldValue("cashChartAccountId", null, false);
              formik.setFieldValue("offsetAccountId", null, false);
            }}
          />
        </Col>
        <Col span={4}>
          <SelectCustom
            formik={formik}
            fieldName="cashBoxId"
            label="settings.entities.cashBox"
            path={selectListEndpoints.cashBoxesSelectList}
          />
        </Col>
        <Col span={4}>
          <SelectCustom
            formik={formik}
            fieldName="paymentTypeId"
            label="cash.fields.paymentType"
            path={selectListEndpoints.paymentTypesSelectList}
          />
        </Col>
        <Col span={4}>
          <DocumentAccountSelect
            formik={formik}
            fieldName="cashChartAccountId"
            label="cash.fields.cashChartAccount"
            documentTypeId={documentTypeId ?? cashDocumentTypeIds.income}
            documentRoleCode={cashDocumentAccountRoleCodes.cashAccount}
            getFirst
            enabled={canUseDocumentAccounts}
            disabled={!canUseDocumentAccounts}
          />
        </Col>
        <Col span={4}>
          <DocumentAccountSelect
            formik={formik}
            fieldName="offsetAccountId"
            label="cash.fields.offsetAccount"
            documentTypeId={documentTypeId ?? cashDocumentTypeIds.income}
            documentRoleCode={cashDocumentAccountRoleCodes.offsetAccount}
            getFirst
            enabled={canUseDocumentAccounts}
            disabled={!canUseDocumentAccounts}
          />
        </Col>
        <Col span={4}>
          <SelectCustom
            formik={formik}
            fieldName="currencyId"
            label="settings.fields.currency"
            path={selectListEndpoints.currenciesSelectList}
          />
        </Col>
        <Col span={4}>
          <SelectCustom
            formik={formik}
            fieldName="counterpartyId"
            label="bank.fields.counterparty"
            path={selectListEndpoints.counterpartiesSelectList}
            addOption={{
              bool: true,
              permissionCode: counterpartyPermissions.create,
              onClick: () => setCounterpartyCreateOpen(true),
            }}
          />
        </Col>
        <Col span={4}>
          <SelectDate
            formik={formik}
            fieldName="docDate"
            label="bank.fields.date"
          />
        </Col>

        <Col span={4}>
          <InputNumberFormat
            formik={formik}
            fieldName="amount"
            label="bank.fields.amount"
            min={0}
            precision={2}
          />
        </Col>
      </Row>
      <CounterpartyAddEditPage
        open={counterpartyCreateOpen}
        onCreated={(counterparty) => {
          formik.setFieldValue("counterpartyId", counterparty.id, true);
          invalidateSelectListQuery(
            queryClient,
            "counterpartyId",
            selectListEndpoints.counterpartiesSelectList,
          );
        }}
        onClose={() => setCounterpartyCreateOpen(false)}
      />
    </>
  );
}
