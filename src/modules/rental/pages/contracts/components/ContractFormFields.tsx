import { Button, Card, Col, Form, Row } from "antd";
import dayjs from "dayjs";
import type { FormikProps } from "formik";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import InputText from "@/components/fields/InputText";
import InputTextArea from "@/components/fields/InputTextArea";
import SearchInnField from "@/components/fields/SearchInnField";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import type { RentalContractForm } from "../types/form";
import ContractObjectTable from "./ContractObjectTable";

interface ContractFormFieldsProps {
  formik: FormikProps<RentalContractForm>;
  isEdit: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  disabled?: boolean;
  actions?: ReactNode;
  onLessorInnChange: (value: string) => void;
  onLessorInnSearch: (value: string) => void;
  lessorInnLookupLoading: boolean;
}

export default function ContractFormFields({
  formik,
  isEdit,
  isSubmitting,
  onCancel,
  disabled = false,
  actions,
  onLessorInnChange,
  onLessorInnSearch,
  lessorInnLookupLoading,
}: ContractFormFieldsProps) {
  const { t } = useTranslation();

  return (
    <Form layout="vertical" onFinish={formik.handleSubmit}>
      <fieldset disabled={disabled} className="min-w-0">
        <Card
          className="sm:p-5! mb-2!"
          // title={t("rental.contracts.general")}
        >
          <Row gutter={[20, 0]}>
            <Col span={6}>
              <InputText
                formik={formik}
                fieldName="lessorFullName"
                label="rental.fields.lessorFullName"
                required
              />
            </Col>
            <Col span={4}>
              <SearchInnField
                mode="inn"
                value={formik.values.lessorInn ?? ""}
                onChange={onLessorInnChange}
                onSearch={onLessorInnSearch}
                loading={lessorInnLookupLoading}
                label="rental.fields.lessorInn"
              />
            </Col>
            <Col span={4}>
              <InputText
                formik={formik}
                fieldName="lessorPinfl"
                label="rental.fields.lessorPinfl"
              />
            </Col>
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
                valueFormat="YYYY-MM-DDT00:00:00"
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
                valueFormat="YYYY-MM-DDT00:00:00"
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
                valueFormat="YYYY-MM-DDT00:00:00"
                minDate={
                  formik.values.startDate
                    ? dayjs(formik.values.startDate)
                    : undefined
                }
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
