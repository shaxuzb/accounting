import { Col, Row } from "antd";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import InputNumber from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import SectionCard from "@/components/ui/card/SectionCard";
import type { RentalAccrualForm } from "../types/form";
import InputText from "@/components/fields/InputText";

interface AccrualEditFormProps {
  formik: FormikProps<RentalAccrualForm>;
  disabled?: boolean;
}

export default function AccrualEditForm({
  formik,
  disabled = false,
}: AccrualEditFormProps) {
  const { t } = useTranslation();

  return (
    <SectionCard
      title={t("rental.accruals.editDetails")}
      bodyClassName="p-3! sm:p-3!"
    >
      <fieldset disabled={disabled} className="min-w-0">
        <Row gutter={[20, 0]}>
          <Col span={4}>
            <InputNumber
              formik={formik}
              fieldName="exchangeRate"
              label="rental.fields.exchangeRate"
              min={0}
              precision={8}
            />
          </Col>
          <Col span={4}>
            <SelectCustom
              formik={formik as FormikProps<object>}
              fieldName="lessorPayableAccountId"
              label="rental.fields.lessorPayableAccount"
              path={selectListEndpoints.chartAccountSelect}
              search
              displayConfig={chartAccountSelectDisplayConfig}
            />
          </Col>
          <Col span={4}>
            <SelectCustom
              formik={formik as FormikProps<object>}
              fieldName="taxPayableAccountId"
              label="rental.fields.taxPayableAccount"
              path={selectListEndpoints.chartAccountSelect}
              search
              displayConfig={chartAccountSelectDisplayConfig}
            />
          </Col>
          <Col span={12}>
            <InputText
              formik={formik}
              fieldName="comment"
              label="rental.fields.comment"
              // rows={3}
              // maxLength={1000}
            />
          </Col>
        </Row>
      </fieldset>
    </SectionCard>
  );
}
