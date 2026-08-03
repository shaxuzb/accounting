import { Button, Col, Divider, Row, Typography, Card as AntdCard } from "antd";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import { Delete, Plus } from "lucide-react";
import InputNumber from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import type { FaDisposalFormValues } from "../types/form";

const { Text } = Typography;

const emptyLine = {
  faAssetId: null,
  saleAmount: 0,
  note: "",
  assetAccountId: null,
  accumulatedDepreciationAccountId: null,
};

export default function FaDisposalFormFields({
  formik,
  isDraft,
}: {
  formik: FormikProps<FaDisposalFormValues>;
  isDraft: boolean;
}) {
  const { t } = useTranslation();
  const handleAddLine = () => {
    formik.setFieldValue("lines", [
      ...formik.values.lines,
      { ...emptyLine },
    ]);
  };
  const handleRemoveLine = (index: number) => {
    formik.setFieldValue(
      "lines",
      formik.values.lines.filter((_, lineIndex) => lineIndex !== index),
    );
  };

  return (
    <>
              <Row gutter={[20, 8]}>
                <Col span={8}>
                  <SelectDate
                    formik={formik}
                    fieldName="disposalDate"
                    label="fa.fields.disposalDate"
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    path={selectListEndpoints.faDisposalTypesSelectList}
                    formik={formik}
                    fieldName="disposalTypeId"
                    label="fa.fields.disposalType"
                  />
                </Col>
                <Col span={8}>
                  <InputText
                    formik={formik}
                    fieldName="reason"
                    label="fa.fields.reason"
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    path={selectListEndpoints.chartAccountsSelectList}
                    displayConfig={chartAccountSelectDisplayConfig}
                    formik={formik}
                    fieldName="disposalAccountId"
                    label="fa.fields.disposalAccount"
                    search
                    required
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    path={selectListEndpoints.chartAccountsSelectList}
                    displayConfig={chartAccountSelectDisplayConfig}
                    formik={formik}
                    fieldName="customerAccountId"
                    label="fa.fields.customerAccount"
                    search
                    required
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    path={selectListEndpoints.chartAccountsSelectList}
                    displayConfig={chartAccountSelectDisplayConfig}
                    formik={formik}
                    fieldName="vatAccountId"
                    label="fa.fields.vatAccount"
                    search
                    required
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    path={selectListEndpoints.chartAccountsSelectList}
                    displayConfig={chartAccountSelectDisplayConfig}
                    formik={formik}
                    fieldName="gainAccountId"
                    label="fa.fields.gainAccount"
                    search
                    required
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    path={selectListEndpoints.chartAccountsSelectList}
                    displayConfig={chartAccountSelectDisplayConfig}
                    formik={formik}
                    fieldName="lossAccountId"
                    label="fa.fields.lossAccount"
                    search
                    required
                  />
                </Col>
              </Row>

              <Divider className="my-4" />
              
              <div className="mb-4 flex justify-between items-center">
                <Text strong className="text-lg">
                  {t("fa.sections.disposalDetails")}
                </Text>
                {isDraft && (
                  <Button
                    type="dashed"
                    icon={<Plus className="size-4" />}
                    onClick={handleAddLine}
                  >
                    {t("common.add")}</Button>
                )}
              </div>

              {formik.values.lines.map((_, lineIndex) => (
                <AntdCard
                  key={`line-${lineIndex}`}
                  size="small"
                  className="mb-4 bg-gray-50/50 border border-border shadow-sm"
                  title={
                    <div className="flex justify-between items-center mb-1">
                      <Text strong>{t("fa.sections.lineNumber", { number: lineIndex + 1 })}</Text>
                      {isDraft && formik.values.lines.length > 1 && (
                        <Button
                          danger
                          size="small"
                          icon={<Delete className="size-4" />}
                          onClick={() => handleRemoveLine(lineIndex)}
                        />
                      )}
                    </div>
                  }
                >
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <SelectCustom
                        path={selectListEndpoints.faAssetsSelectList}
                        formik={formik}
                        fieldName={`lines[${lineIndex}].faAssetId`}
                        label="fa.fields.faAssetId"
                      />
                    </Col>
                    <Col span={8}>
                      <InputNumber
                        formik={formik}
                        fieldName={`lines[${lineIndex}].saleAmount`}
                        label="fa.fields.saleAmount"
                      />
                    </Col>
                    <Col span={8}>
                      <InputText
                        formik={formik}
                        fieldName={`lines[${lineIndex}].note`}
                        label="fa.fields.note"
                      />
                    </Col>
                    <Col span={12}>
                      <SelectCustom
                        path={selectListEndpoints.chartAccountsSelectList}
                        displayConfig={chartAccountSelectDisplayConfig}
                        formik={formik}
                        fieldName={`lines[${lineIndex}].assetAccountId`}
                        label="fa.fields.assetAccount"
                        search
                        required
                      />
                    </Col>
                    <Col span={12}>
                      <SelectCustom
                        path={selectListEndpoints.chartAccountsSelectList}
                        displayConfig={chartAccountSelectDisplayConfig}
                        formik={formik}
                        fieldName={`lines[${lineIndex}].accumulatedDepreciationAccountId`}
                        label="fa.fields.accumulatedDepreciationAccount"
                        search
                        required
                      />
                    </Col>
                  </Row>
                </AntdCard>
              ))}
              
              {typeof formik.errors.lines === "string" && (
                <div className="text-red-500 text-sm mt-2">
                  {formik.errors.lines}
                </div>
              )}
    </>
  );
}
