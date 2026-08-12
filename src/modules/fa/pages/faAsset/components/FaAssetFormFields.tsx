import { Alert, Col, Row } from "antd";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import Card from "@/components/ui/card/Card";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { FaAssetFormValues } from "../types/form";

export default function FaAssetFormFields({
  formik,
}: {
  formik: FormikProps<FaAssetFormValues>;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <Alert
        type="info"
        showIcon
        message={t("fa.asset.cardEditNotice")}
        description={t("fa.asset.cardEditDescription")}
      />
      <Card className="p-4 sm:p-5">
        <div className="mb-4 border-b border-border pb-3">
          <div className="text-base font-semibold text-heading">
            {t("fa.asset.identification")}
          </div>
          <div className="mt-1 text-sm text-secondary-text">
            {t("fa.asset.identificationDescription")}
          </div>
        </div>
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12} xl={6}>
            <InputText formik={formik} fieldName="inventoryNumber" label="fa.fields.inventoryNumber" required />
          </Col>
          <Col xs={24} md={12} xl={6}>
            <InputText formik={formik} fieldName="name" label="fa.fields.name" required />
          </Col>
          <Col xs={24} md={12} xl={6}>
            <SelectCustom formik={formik} fieldName="faGroupId" label="fa.fields.faGroup" path={selectListEndpoints.faGroupsSelectList} search required />
          </Col>
          <Col xs={24} md={12} xl={6}>
            <SelectCustom formik={formik} fieldName="okofId" label="fa.fields.okof" path={selectListEndpoints.okofsSelectList} search required />
          </Col>
        </Row>
      </Card>
    </div>
  );
}
