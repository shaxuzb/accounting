import { Button, Col, Form, Row, Segmented } from "antd";
import dayjs from "dayjs";
import type { FormikProps } from "formik";
import { useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, UsersRound } from "lucide-react";
import InputText from "@/components/fields/InputText";
import SearchInnField from "@/components/fields/SearchInnField";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import SelectStatic from "@/components/fields/SelectStatic";
import SectionCard from "@/components/ui/card/SectionCard";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import type { RentalContractForm } from "../types/form";
import ContractObjectTable from "./ContractObjectTable";
import { emptyLessor } from "../utils/defaults";
import {
  getRentalPaidValues,
  normalizeRentalContractForMode,
  restoreRentalPaidValues,
  type RentalPaidValues,
} from "../utils/mode";
import InputPhoneNumber from "@/components/fields/InputPhoneNumber";

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
  const paidValuesRef = useRef<RentalPaidValues | null>(null);

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
    if (!checked && paidValuesRef.current) {
      const restoredValues = restoreRentalPaidValues(
        values,
        paidValuesRef.current,
      );
      paidValuesRef.current = null;
      void formik.setValues(restoredValues, true);
      return;
    }
    if (checked) {
      paidValuesRef.current = getRentalPaidValues(formik.values);
    }
    formik.setValues(
      checked ? normalizeRentalContractForMode(values) : values,
      true,
    );
  };

  return (
    <Form layout="vertical" onFinish={formik.handleSubmit}>
      <fieldset disabled={disabled} className="min-w-0">
        <SectionCard
          title="rental.contracts.general"
          bodyClassName="p-4! sm:p-3!"
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
            <div className=" w-70">
              <Form.Item
                label={t("rental.fields.rentalType")}
                className="mb-0!"
              >
                <Segmented
                  block
                  value={isFreeOfCharge ? "free" : "paid"}
                  disabled={disabled}
                  onChange={(value) => handleFreeRentalChange(value === "free")}
                  options={[
                    { value: "paid", label: t("rental.modes.paid") },
                    { value: "free", label: t("rental.modes.free") },
                  ]}
                />
              </Form.Item>
            </div>
            <Col span={16}>
              <InputText
                formik={formik}
                fieldName="comment"
                label="rental.fields.comment"
                // rows={3}
                // maxLength={1000}
              />
            </Col>
          </Row>
        </SectionCard>

        <SectionCard
          title="rental.fields.lessors"
          icon={<UsersRound className="size-4" />}
          className="mt-2! mb-2!"
          bodyClassName="p-4! sm:p-3!"
          extra={
            !disabled && (
              <Button
                type="primary"
                ghost
                size="small"
                icon={<Plus className="size-4" />}
                onClick={addLessor}
              >
                {t("common.add")}
              </Button>
            )
          }
        >
          <div className="space-y-2 ">
            {formik.values.lessors.map((lessor, lessorIndex) => (
              <div
                key={`lessor-${lessorIndex}`}
                className="overflow-hidden rounded-lg border border-border/70 bg-background/40"
              >
                <div className="flex items-center justify-between gap-3 border-b border-border/60 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-bg text-xs font-semibold text-primary">
                      {lessorIndex + 1}
                    </span>
                    <span className="truncate text-sm font-semibold text-text">
                      {lessorIndex + 1}. {t("rental.fields.lessorFullName")}
                    </span>
                  </div>
                  {!disabled && formik.values.lessors.length > 1 && (
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<Trash2 className="size-4" />}
                      onClick={() => removeLessor(lessorIndex)}
                    >
                      {t("common.delete")}
                    </Button>
                  )}
                </div>
                <div className="p-3">
                  <Row gutter={[16, 0]}>
                    <Col span={4}>
                      <SelectStatic
                        formik={formik as FormikProps<object>}
                        fieldName={`lessors[${lessorIndex}].lessorKindCode`}
                        label="rental.fields.lessorKind"
                        options={[
                          {
                            value: "INDIVIDUAL",
                            label: "rental.lessor.individual",
                          },
                          {
                            value: "LEGAL_ENTITY",
                            label: "rental.lessor.legalEntity",
                          },
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
                        onChange={(value) =>
                          onLessorIdentifierChange(lessorIndex, value)
                        }
                        onSearch={(value) =>
                          onLessorIdentifierSearch(lessorIndex, value)
                        }
                        loading={lessorInnLookupLoading}
                        disabled={disabled}
                        label="rental.fields.lessorInn"
                      />
                    </Col>
                    <Col span={5}>
                      <InputPhoneNumber
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
                  </Row>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

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
