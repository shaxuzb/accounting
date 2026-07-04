import type { FormikProps } from "formik";
import { Col, Row } from "antd";
import InputNumberFormat from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { CashOperationForm } from "@/modules/cashoperation/pages/cashoperation/types/form";

interface CashOperationFormFieldsProps {
  formik: FormikProps<CashOperationForm>;
  disabled?: boolean;
}

export default function CashOperationFormFields({
  formik,
  disabled = false,
}: CashOperationFormFieldsProps) {
  return (
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
          fieldName="operationTypeId"
          label="Operatsiya turi"
          path={selectListEndpoints.operationTypes}
          disabled={disabled}
        />
      </Col>
      <Col span={12}>
        <SelectCustom
          formik={formik}
          fieldName="paymentPurposeId"
          label="To'lov maqsadi"
          path={selectListEndpoints.paymentPurposesSelectList}
          queryParams={{ operationTypeId: formik.values.operationTypeId }}
          disabled={!formik.values.operationTypeId || disabled}
        />
      </Col>
      <Col span={12}>
        <SelectCustom
          formik={formik}
          fieldName="counterpartyId"
          label="bank.fields.counterparty"
          path={selectListEndpoints.counterpartiesSelectList}
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
  );
}
