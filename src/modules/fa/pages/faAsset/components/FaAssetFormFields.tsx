import { Col, Row } from "antd";
import type { FormikProps } from "formik";
import InputNumberFormat from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import type { FaAssetFormValues } from "../types/form";

interface FaAssetFormFieldsProps {
  formik: FormikProps<FaAssetFormValues>;
  isCreate: boolean;
}

export default function FaAssetFormFields({
  formik,
  isCreate,
}: FaAssetFormFieldsProps) {
  return (
    <Row gutter={[20, 8]}>
      <Col xs={24} md={12}>
        <InputText
          formik={formik}
          fieldName="inventoryNumber"
          label="fa.fields.inventoryNumber"
        />
      </Col>
      <Col xs={24} md={12}>
        <InputText
          formik={formik}
          fieldName="name"
          label="fa.fields.name"
        />
      </Col>
      <Col xs={24} md={12} xl={8}>
        <SelectCustom
          formik={formik}
          fieldName="faGroupId"
          label="fa.fields.faGroup"
          path={selectListEndpoints.faGroupsSelectList}
        />
      </Col>
      <Col xs={24} md={12} xl={8}>
        <SelectCustom
          formik={formik}
          fieldName="okofId"
          label="fa.fields.okof"
          path={selectListEndpoints.okofsSelectList}
        />
      </Col>
      <Col xs={24} md={12} xl={8}>
        <SelectCustom
          formik={formik}
          fieldName="depreciationMethodId"
          label="fa.fields.depreciationMethod"
          path={selectListEndpoints.depreciationMethodsSelectList}
        />
      </Col>
      <Col xs={24} md={12} xl={8}>
        <InputNumberFormat
          formik={formik}
          fieldName="usefulLifeMonths"
          label="fa.fields.usefulLifeMonths"
          min={1}
        />
      </Col>
      <Col xs={24} md={12} xl={8}>
        <InputNumberFormat
          formik={formik}
          fieldName="initialCost"
          label="fa.fields.initialCost"
          min={0}
        />
      </Col>
      <Col xs={24} md={12} xl={8}>
        <InputNumberFormat
          formik={formik}
          fieldName="salvageValue"
          label="fa.fields.salvageValue"
          min={0}
        />
      </Col>
      <Col xs={24} md={12} xl={8}>
        <SelectDate
          formik={formik}
          fieldName="commissioningDate"
          label="fa.fields.commissioningDate"
        />
      </Col>
      <Col xs={24} md={12} xl={8}>
        <SelectDate
          formik={formik}
          fieldName="deprStartDate"
          label="fa.fields.deprStartDate"
        />
      </Col>
      <Col xs={24} md={12} xl={8}>
        <InputNumberFormat
          formik={formik}
          fieldName="plannedUnitsTotal"
          label="fa.fields.plannedUnitsTotal"
          min={0}
        />
      </Col>
      <Col xs={24} md={12} xl={8}>
        <SelectCustom
          formik={formik}
          fieldName="sourceProductTableId"
          label="fa.fields.sourceProductTable"
          path={selectListEndpoints.productsSelectList}
        />
      </Col>
      <Col xs={24} md={12} xl={8}>
        <SelectCustom
          formik={formik}
          fieldName="departmentId"
          label="fa.fields.department"
          path={selectListEndpoints.departmentsSelectList}
        />
      </Col>
      <Col xs={24} md={12} xl={8}>
        <SelectCustom
          formik={formik}
          fieldName="responsibleUserId"
          label="fa.fields.responsibleUser"
          path={selectListEndpoints.usersSelectList}
          allowedIds={
            formik.values.responsibleUserId == null
              ? []
              : [formik.values.responsibleUserId]
          }
          disabled
          required
        />
      </Col>
      <Col xs={24} md={12} xl={8}>
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
      <Col xs={24} md={12} xl={8}>
        <SelectCustom
          formik={formik}
          fieldName="accumulatedDepreciationAccountId"
          label="fa.fields.accumulatedDepreciationAccount"
          path={selectListEndpoints.chartAccountsSelectList}
          displayConfig={chartAccountSelectDisplayConfig}
          search
          required
        />
      </Col>
      <Col xs={24} md={12} xl={8}>
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
      {!isCreate && (
        <Col xs={24} md={12} xl={8}>
          <SelectCustom
            formik={formik}
            fieldName="stateId"
            label="fa.fields.state"
            path={selectListEndpoints.statesSelectList}
          />
        </Col>
      )}
    </Row>
  );
}
