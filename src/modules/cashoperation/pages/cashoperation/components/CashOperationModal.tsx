import type { FormikProps } from "formik";
import { useState } from "react";
import { Col, Row } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import InputNumberFormat from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import CounterpartyAddEditPage from "@/modules/settings/pages/counterparty/screens/CounterpartyAddEditPage";
import { counterpartyPermissions } from "@/modules/settings/pages/counterparty/constants/permissions";
import {
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { invalidateSelectListQuery } from "@/shared/utils/invalidateSelectListQuery";
import type { CashOperationForm } from "@/modules/cashoperation/pages/cashoperation/types/form";
import {
  cashDocumentAccountRoleCodes,
  cashDocumentTypeIds,
  getCashDocumentTypeId,
} from "@/modules/cashoperation/constants/documentAccount";

interface CashOperationFormFieldsProps {
  formik: FormikProps<CashOperationForm>;
  disabled?: boolean;
}

export default function CashOperationFormFields({
  formik,
  disabled = false,
}: CashOperationFormFieldsProps) {
  const [counterpartyCreateOpen, setCounterpartyCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const documentTypeId = getCashDocumentTypeId(formik.values.operationTypeId);
  const canUseDocumentAccounts = documentTypeId !== null;

  return (
    <>
      <Row gutter={[16, 8]}>
      <Col span={12}>
        <SelectCustom
          formik={formik}
          fieldName="cashBoxId"
          label="settings.entities.cashBox"
          path={selectListEndpoints.cashBoxesSelectList}
          disabled={disabled}
        />
      </Col>
      <Col span={12}>
        <DocumentAccountSelect
          formik={formik}
          fieldName="cashChartAccountId"
          label="Kassa schyoti"
          documentTypeId={documentTypeId ?? cashDocumentTypeIds.income}
          documentRoleCode={cashDocumentAccountRoleCodes.cashAccount}
          getFirst
          enabled={canUseDocumentAccounts && !disabled}
          disabled={disabled || !canUseDocumentAccounts}
        />
      </Col>
      <Col span={12}>
        <DocumentAccountSelect
          formik={formik}
          fieldName="offsetAccountId"
          label="Qarama-qarshi schyot"
          documentTypeId={documentTypeId ?? cashDocumentTypeIds.income}
          documentRoleCode={cashDocumentAccountRoleCodes.offsetAccount}
          getFirst
          enabled={canUseDocumentAccounts && !disabled}
          disabled={disabled || !canUseDocumentAccounts}
        />
      </Col>
      <Col span={12}>
        <SelectCustom
          formik={formik}
          fieldName="operationTypeId"
          label="Operatsiya turi"
          path={selectListEndpoints.operationTypes}
          onChange={(value) => {
            if (Number(value) === Number(formik.values.operationTypeId)) return;

            formik.setFieldValue("cashChartAccountId", null, false);
            formik.setFieldValue("offsetAccountId", null, false);
          }}
          disabled={disabled}
        />
      </Col>
      <Col span={12}>
        <SelectCustom
          formik={formik}
          fieldName="paymentTypeId"
          label="To'lov turi"
          path={selectListEndpoints.paymentTypesSelectList}
          disabled={disabled}
        />
      </Col>
      <Col span={12}>
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
          disabled={disabled}
        />
      </Col>
      <Col span={12}>
        <SelectDate
          formik={formik}
          fieldName="docDate"
          label="bank.fields.date"
          disabled={disabled}
        />
      </Col>
      <Col span={12}>
        <SelectCustom
          formik={formik}
          fieldName="currencyId"
          label="settings.fields.currency"
          path={selectListEndpoints.currenciesSelectList}
          disabled={disabled}
        />
      </Col>
      <Col span={12}>
        <InputNumberFormat
          formik={formik}
          fieldName="amount"
          label="bank.fields.amount"
          min={0}
          precision={2}
          disabled={disabled}
        />
      </Col>
      <Col span={24}>
        <InputText
          formik={formik}
          fieldName="comment"
          label="bank.fields.comment"
          disabled={disabled}
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
