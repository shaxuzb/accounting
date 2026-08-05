import { Col, Row } from "antd";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import InputNumber from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import Card from "@/components/ui/card/Card";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import type { FaAssetFormValues } from "../types/form";

interface FaAssetFormFieldsProps {
  formik: FormikProps<FaAssetFormValues>;
  isCreate: boolean;
}

interface SectionHeaderProps {
  title: string;
  description: string;
}

function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-3 border-b border-border pb-3">
      <div className="text-base font-semibold text-heading">{title}</div>
      <div className="mt-1 text-sm text-secondary-text">{description}</div>
    </div>
  );
}

export default function FaAssetFormFields({
  formik,
  isCreate,
}: FaAssetFormFieldsProps) {
  const { t } = useTranslation();

  return (
    <div className="min-w-0 space-y-2">
      <Card className="p-3">
        <Row gutter={[16, 0]}>
          <Col span={4}>
            <InputText
              formik={formik}
              fieldName="inventoryNumber"
              label="fa.fields.inventoryNumber"
              required
            />
          </Col>
          <Col span={4}>
            <InputText
              formik={formik}
              fieldName="name"
              label="fa.fields.name"
              required
            />
          </Col>
          <Col span={4}>
            <SelectCustom
              formik={formik}
              fieldName="sourceProductTableId"
              label="fa.fields.sourceProductTable"
              path={selectListEndpoints.productsSelectList}
              search
              required
            />
          </Col>
          <Col span={4}>
            <SelectCustom
              formik={formik}
              fieldName="assetAccountId"
              label="fa.fields.assetAccount"
              path={selectListEndpoints.chartAccountsSelectList}
              displayConfig={chartAccountSelectDisplayConfig}
              search
              required
            />
          </Col>
          <Col span={4}>
            <SelectCustom
              formik={formik}
              fieldName="accumulatedDepreciationAccountId"
              label="fa.fields.accumulatedDepreciationAccount"
              path={selectListEndpoints.chartAccountsSelectList}
              displayConfig={chartAccountSelectDisplayConfig}
              search
            />
          </Col>
          <Col span={4}>
            <SelectCustom
              formik={formik}
              fieldName="depreciationExpenseAccountId"
              label="fa.fields.depreciationExpenseAccount"
              path={selectListEndpoints.chartAccountsSelectList}
              displayConfig={chartAccountSelectDisplayConfig}
              search
              required
            />
          </Col>
        </Row>
      </Card>

      <div className="grid min-w-0 gap-2 xl:grid-cols-2">
        <Card className="p-3">
          <SectionHeader
            title={t("fa.asset.classification")}
            description={t("fa.asset.classificationDescription")}
          />
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <SelectCustom
                formik={formik}
                fieldName="faGroupId"
                label="fa.fields.faGroup"
                path={selectListEndpoints.faGroupsSelectList}
                search
                required
              />
            </Col>
            <Col xs={24} md={12}>
              <SelectCustom
                formik={formik}
                fieldName="okofId"
                label="fa.fields.okof"
                path={selectListEndpoints.okofsSelectList}
                search
                required
              />
            </Col>
            <Col xs={24} md={12}>
              <SelectCustom
                formik={formik}
                fieldName="depreciationMethodId"
                label="fa.fields.depreciationMethod"
                path={selectListEndpoints.depreciationMethodsSelectList}
                required
              />
            </Col>
            <Col xs={24} md={12}>
              <InputNumber
                formik={formik}
                fieldName="usefulLifeMonths"
                label="fa.fields.usefulLifeMonths"
                min={1}
                required
              />
            </Col>
            <Col xs={24}>
              <InputNumber
                formik={formik}
                fieldName="plannedUnitsTotal"
                label="fa.fields.plannedUnitsTotal"
                min={0}
                required
              />
            </Col>
          </Row>
        </Card>

        <Card className="p-3">
          <SectionHeader
            title={t("fa.asset.valuation")}
            description={t("fa.asset.valuationDescription")}
          />
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <InputNumber
                formik={formik}
                fieldName="initialCost"
                label="fa.fields.initialCost"
                min={0}
                required
              />
            </Col>
            <Col xs={24} md={12}>
              <InputNumber
                formik={formik}
                fieldName="salvageValue"
                label="fa.fields.salvageValue"
                min={0}
                required
              />
            </Col>
            <Col xs={24} md={12}>
              <SelectDate
                formik={formik}
                fieldName="commissioningDate"
                label="fa.fields.commissioningDate"
                required
              />
            </Col>
            <Col xs={24} md={12}>
              <SelectDate
                formik={formik}
                fieldName="deprStartDate"
                label="fa.fields.deprStartDate"
                required
              />
            </Col>
          </Row>
        </Card>
      </div>

      <Card className="p-3">
        <SectionHeader
          title={t("fa.asset.placement")}
          description={t("fa.asset.placementDescription")}
        />
        <Row gutter={[16, 0]}>
          <Col xs={24} md={8}>
            <SelectCustom
              formik={formik}
              fieldName="departmentId"
              label="fa.fields.department"
              path={selectListEndpoints.departmentsSelectList}
              search
              required
            />
          </Col>
          <Col xs={24} md={8}>
            <SelectCustom
              formik={formik}
              fieldName="responsibleUserId"
              label="fa.fields.responsibleUser"
              path={selectListEndpoints.usersSelectList}
              search
              required
              disabled
            />
          </Col>
          {!isCreate && (
            <Col xs={24} md={8}>
              <SelectCustom
                formik={formik}
                fieldName="stateId"
                label="fa.fields.state"
                path={selectListEndpoints.statesSelectList}
              />
            </Col>
          )}
        </Row>
      </Card>

      {/* <Card className="p-3">
        <SectionHeader
          title={t("fa.sections.accounts")}
          description={t("fa.asset.accountsDescription")}
        />
        <Row gutter={[16, 0]}>
         
        </Row>
      </Card> */}
    </div>
  );
}
