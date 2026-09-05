import { Button, Card, Checkbox, Col, Form, Row } from "antd";
import dayjs from "dayjs";
import type { FormikProps } from "formik";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import InputText from "@/components/fields/InputText";
import InputTextArea from "@/components/fields/InputTextArea";
import SearchInnField from "@/components/fields/SearchInnField";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import SelectStatic from "@/components/fields/SelectStatic";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import type { RentalContractForm } from "../types/form";
import ContractObjectTable from "./ContractObjectTable";
import { emptyLessor } from "../utils/defaults";
import { normalizeRentalContractForMode } from "../utils/mode";

interface ContractFormFieldsProps {
  formik: FormikProps<RentalContractForm>;
  isEdit: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  disabled?: boolean;
  actions?: ReactNode;
  onLessorIdentifierChange: (index: number, value: string) => void;
  onLessorIdentifierSearch: (index: number, value: string) => void;
  lessorInnLookupLoading: boolean;
}

export default function ContractFormFields({
  formik,
  isEdit,
  isSubmitting,
  onCancel,
  disabled = false,
  actions,
  onLessorIdentifierChange,
  onLessorIdentifierSearch,
  lessorInnLookupLoading,
}: ContractFormFieldsProps) {
  const { t } = useTranslation();
  const isFreeOfCharge = formik.values.isFreeOfCharge;

  const addLessor = () => {
    void formik.setFieldValue("lessors", [
      ...formik.values.lessors,
      emptyLessor(),
    ]);
  };

  const removeLessor = (index: number) => {
    if (formik.values.lessors.length <= 1) return;
    void formik.setFieldValue(
      "lessors",
      formik.values.lessors.filter((_, lessorIndex) => lessorIndex !== index),
    );
  };

  const handleFreeRentalChange = (checked: boolean) => {
    const values = {
      ...formik.values,
      isFreeOfCharge: checked,
    };
    formik.setValues(
      checked ? normalizeRentalContractForMode(values) : values,
      true,
    );
  };

  return (
    <Form layout="vertical" onFinish={formik.handleSubmit}>
      <fieldset disabled={disabled} className="min-w-0">
        <Card
          className="sm:p-5! mb-2!"
          // title={t("rental.contracts.general")}
        >
          <Row gutter={[20, 0]}>
            <Col span={4}>
              <InputText
                formik={formik}
                fieldName="contractNumber"
                label="rental.fields.contractNumber"
                required
              />
            </Col>
            <Col span={4}>
              <SelectDate
                formik={formik}
                fieldName="contractDate"
                label="rental.fields.contractDate"
                valueFormat="YYYY-MM-DD"
                required
              />
            </Col>
            <Col span={4}>
              <SelectCustom
                formik={formik}
                fieldName="currencyId"
                label="rental.fields.currency"
                path={selectListEndpoints.currenciesSelectList}
                required
                search
              />
            </Col>
            <Col span={4}>
              <Form.Item className="flex! flex-col! mb-6!">
                <Checkbox
                  checked={isFreeOfCharge}
                  onChange={(event) => handleFreeRentalChange(event.target.checked)}
                  disabled={disabled}
                >
                  {t("rental.fields.isFreeOfCharge")}
                </Checkbox>
              </Form.Item>
            </Col>
            <Col span={4}>
              <SelectDate
                formik={formik}
                fieldName="startDate"
                label="rental.fields.startDate"
                valueFormat="YYYY-MM-DD"
                maxDate={
                  formik.values.endDate
                    ? dayjs(formik.values.endDate)
                    : undefined
                }
                required
              />
            </Col>
            <Col span={4}>
              <SelectDate
                formik={formik}
                fieldName="endDate"
                label="rental.fields.endDate"
                valueFormat="YYYY-MM-DD"
                minDate={
                  formik.values.startDate
                    ? dayjs(formik.values.startDate)
                    : undefined
                }
                clearable
                required
              />
            </Col>
            <Col span={4}>
              <SelectCustom
                formik={formik as FormikProps<object>}
                fieldName="lessorPayableAccountId"
                label="rental.fields.lessorPayableAccount"
                path={selectListEndpoints.chartAccountsSelectList}
                displayConfig={chartAccountSelectDisplayConfig}
                search
                required={!isFreeOfCharge}
                disabled={isFreeOfCharge}
              />
            </Col>
            <Col span={4}>
              <SelectCustom
                formik={formik as FormikProps<object>}
                fieldName="taxPayableAccountId"
                label="rental.fields.taxPayableAccount"
                path={selectListEndpoints.chartAccountsSelectList}
                displayConfig={chartAccountSelectDisplayConfig}
                search
                required={!isFreeOfCharge}
                disabled={isFreeOfCharge}
              />
            </Col>
            <Col span={24}>
              <InputTextArea
                formik={formik}
                fieldName="comment"
                label="rental.fields.comment"
                // rows={3}
                // maxLength={1000}
              />
            </Col>
          </Row>
          <div className="mt-2 border-t border-border/60 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold">{t("rental.fields.lessors")}</span>
              {!disabled && (
                <Button
                  type="dashed"
                  size="small"
                  icon={<Plus className="size-4" />}
                  onClick={addLessor}
                >
                  {t("common.add")}
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {formik.values.lessors.map((lessor, lessorIndex) => (
                <div
                  key={`lessor-${lessorIndex}`}
                  className="rounded-xl border border-border/60 bg-background/40 p-3"
                >
                  <Row gutter={[20, 0]}>
                    <Col span={4}>
                      <SelectStatic
                        formik={formik as FormikProps<object>}
                        fieldName={`lessors[${lessorIndex}].lessorKindCode`}
                        label="rental.fields.lessorKind"
                        options={[
                          { value: "INDIVIDUAL", label: "rental.lessor.individual" },
                          { value: "LEGAL_ENTITY", label: "rental.lessor.legalEntity" },
                        ]}
                        required
                        disabled={disabled}
                      />
                    </Col>
                    <Col span={6}>
                      <InputText
                        formik={formik}
                        fieldName={`lessors[${lessorIndex}].fullName`}
                        label="rental.fields.lessorFullName"
                        required
                        disabled={disabled}
                      />
                    </Col>
                    <Col span={5}>
                      <SearchInnField
                        mode="auto"
                        value={lessor.inn || lessor.pinfl || ""}
                        onChange={(value) => onLessorIdentifierChange(lessorIndex, value)}
                        onSearch={(value) => onLessorIdentifierSearch(lessorIndex, value)}
                        loading={lessorInnLookupLoading}
                        disabled={disabled}
                        label="rental.fields.innOrPinfl"
                      />
                    </Col>
                    <Col span={5}>
                      <InputText
                        formik={formik}
                        fieldName={`lessors[${lessorIndex}].phoneNumber`}
                        label="rental.fields.phoneNumber"
                        disabled={disabled}
                      />
                    </Col>
                    <Col span={12}>
                      <InputText
                        formik={formik}
                        fieldName={`lessors[${lessorIndex}].registeredAddress`}
                        label="rental.fields.registeredAddress"
                        disabled={disabled}
                      />
                    </Col>
                    <Col span={11}>
                      <InputText
                        formik={formik}
                        fieldName={`lessors[${lessorIndex}].residentialAddress`}
                        label="rental.fields.residentialAddress"
                        disabled={disabled}
                      />
                    </Col>
                    <Col span={1} className="flex items-center justify-end">
                      {!disabled && formik.values.lessors.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<Trash2 className="size-4" />}
                          onClick={() => removeLessor(lessorIndex)}
                          aria-label={t("common.delete")}
                        />
                      )}
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <ContractObjectTable formik={formik} disabled={disabled} />
      </fieldset>

      {actions ?? (
        <div className="mt-4 flex justify-end gap-2">
          <Button size="large" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isSubmitting}
          >
            {isEdit ? t("common.save") : t("common.create")}
          </Button>
        </div>
      )}
    </Form>
  );
}
