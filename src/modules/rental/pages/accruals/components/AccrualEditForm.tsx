import { Col, Row } from "antd";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import InputNumber from "@/components/fields/InputNumber";
import InputTextArea from "@/components/fields/InputTextArea";
import RentalAccountSelect from "@/modules/rental/shared/components/RentalAccountSelect";
import SectionCard from "@/components/ui/card/SectionCard";
import type { RentalAccrualForm } from "../types/form";

interface AccrualEditFormProps {
  formik: FormikProps<RentalAccrualForm>;
}

export default function AccrualEditForm({
  formik,
}: AccrualEditFormProps) {
  const { t } = useTranslation();

  return (
    <SectionCard
      title={t("rental.accruals.editDetails")}
      bodyClassName="p-5! sm:p-6!"
    >
      <Row gutter={[20, 8]}>
        <Col xs={24} md={8}>
          <InputNumber
            formik={formik}
            fieldName="exchangeRate"
            label="rental.fields.exchangeRate"
            min={0}
            precision={8}
          />
        </Col>
        <Col xs={24} md={8}>
          <RentalAccountSelect
            formik={formik}
            fieldName="lessorPayableAccountId"
            label="rental.fields.lessorPayableAccount"
          />
        </Col>
        <Col xs={24} md={8}>
          <RentalAccountSelect
            formik={formik}
            fieldName="taxPayableAccountId"
            label="rental.fields.taxPayableAccount"
          />
        </Col>
        <Col span={24}>
          <InputTextArea
            formik={formik}
            fieldName="comment"
            label="rental.fields.comment"
            rows={3}
            maxLength={1000}
          />
        </Col>
      </Row>
    </SectionCard>
  );
}
