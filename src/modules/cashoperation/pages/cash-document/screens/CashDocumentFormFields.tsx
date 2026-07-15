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
import { cashDocumentAccountRoleCodes } from "@/modules/cashoperation/constants/documentAccount";
import type { CashDocumentForm } from "../types/form";

interface CashDocumentFormFieldsProps {
  formik: FormikProps<CashDocumentForm>;
  documentTypeId: number;
  disabled?: boolean;
}

export default function CashDocumentFormFields({
  formik,
  documentTypeId,
  disabled = false,
}: CashDocumentFormFieldsProps) {
  const [counterpartyCreateOpen, setCounterpartyCreateOpen] = useState(false);
  const queryClient = useQueryClient();

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
        <SelectCustom
          formik={formik}
          fieldName="paymentTypeId"
          label="To'lov turi"
          path={selectListEndpoints.paymentTypesSelectList}
          disabled={disabled}
        />
      </Col>
      <Col span={12}>
        <DocumentAccountSelect
          formik={formik}
          fieldName="cashChartAccountId"
          label="Kassa schyoti"
          documentTypeId={documentTypeId}
          documentRoleCode={cashDocumentAccountRoleCodes.cashAccount}
          getFirst
          disabled={disabled}
        />
      </Col>
      <Col span={12}>
        <DocumentAccountSelect
          formik={formik}
          fieldName="offsetAccountId"
          label="Qarama-qarshi schyot"
          documentTypeId={documentTypeId}
          documentRoleCode={cashDocumentAccountRoleCodes.offsetAccount}
          getFirst
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
      <Col span={12}>
        <InputNumberFormat
          formik={formik}
          fieldName="exchangeRate"
          label="Kurs"
          min={0}
          precision={4}
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
