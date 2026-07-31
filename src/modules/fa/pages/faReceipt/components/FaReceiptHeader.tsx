import { Col, Row } from "antd";
import SelectDate from "@/components/fields/SelectDate";
import SelectCustom from "@/components/fields/SelectCustom";
import InputText from "@/components/fields/InputText";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { FormikProps } from "formik";
import type { FaReceiptFormValues } from "../types/form";

interface FaReceiptHeaderProps {
  formik: FormikProps<FaReceiptFormValues>;
}

export default function FaReceiptHeader({ formik }: FaReceiptHeaderProps) {
  return (
    <Row gutter={[20, 8]}>
      <Col span={8}>
        <SelectDate
          formik={formik}
          fieldName="docDate"
          label="fa.fields.docDate"
        />
      </Col>
      <Col span={8}>
        <SelectCustom
          path={selectListEndpoints.counterpartiesSelectList}
          formik={formik}
          fieldName="counterpartyId"
          label="fa.fields.counterpartyId"
        />
      </Col>
      <Col span={8}>
        <SelectCustom
          path={selectListEndpoints.warehousesSelectList}
          formik={formik}
          fieldName="warehouseId"
          label="fa.fields.warehouseId"
        />
      </Col>
      <Col span={8}>
        <SelectCustom
          path={selectListEndpoints.currenciesSelectList}
          formik={formik}
          fieldName="currencyId"
          label="fa.fields.currencyId"
        />
      </Col>
      <Col span={8}>
        <InputText
          formik={formik}
          fieldName="receiptType"
          label="fa.fields.receiptType"
        />
      </Col>
    </Row>
  );
}
