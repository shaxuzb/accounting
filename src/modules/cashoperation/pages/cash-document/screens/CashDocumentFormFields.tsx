import type { FormikProps } from "formik";
import { Col, Row } from "antd";
import InputNumberFormat from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { CashDocumentForm } from "../types/form";
import type { CashDocumentKind } from "../types/type";

interface CashDocumentFormFieldsProps {
  formik: FormikProps<CashDocumentForm>;
  kind: CashDocumentKind;
  disabled?: boolean;
}

export default function CashDocumentFormFields({
  formik,
  kind,
  disabled = false,
}: CashDocumentFormFieldsProps) {
  const operationTypeId = kind === "pko" ? 1 : 2;

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
          fieldName="paymentPurposeId"
          label="To'lov maqsadi"
          path={selectListEndpoints.paymentPurposesSelectList}
          queryParams={{ operationTypeId }}
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
  );
}
