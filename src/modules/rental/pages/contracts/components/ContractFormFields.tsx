import { Button, Col, Form, Row } from "antd";
import dayjs from "dayjs";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import InputText from "@/components/fields/InputText";
import InputTextArea from "@/components/fields/InputTextArea";
import SearchInnField from "@/components/fields/SearchInnField";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import SectionCard from "@/components/ui/card/SectionCard";
import RentalAccountSelect from "@/modules/rental/shared/components/RentalAccountSelect";
import type { RentalContractForm } from "../types/form";
import ContractObjectsEditor from "./ContractObjectsEditor";

interface ContractFormFieldsProps {
  formik: FormikProps<RentalContractForm>;
  isEdit: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onLessorInnChange: (value: string) => void;
  onLessorInnSearch: (value: string) => void;
  lessorInnLookupLoading: boolean;
}

export default function ContractFormFields({
  formik,
  isEdit,
  isSubmitting,
  onCancel,
  onLessorInnChange,
  onLessorInnSearch,
  lessorInnLookupLoading,
}: ContractFormFieldsProps) {
  const { t } = useTranslation();

  return (
    <Form layout="vertical" onFinish={formik.handleSubmit}>
      <SectionCard
        className="mb-4"
        bodyClassName="p-5! sm:p-6!"
        title={t("rental.contracts.general")}
      >
        <Row gutter={[20, 8]}>
          <Col xs={24} md={12} lg={8}>
            <InputText
              formik={formik}
              fieldName="lessorFullName"
              label="rental.fields.lessorFullName"
              required
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <SearchInnField
              mode="inn"
              value={formik.values.lessorInn ?? ""}
              onChange={onLessorInnChange}
              onSearch={onLessorInnSearch}
              loading={lessorInnLookupLoading}
              label="rental.fields.lessorInn"
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <InputText
              formik={formik}
              fieldName="lessorPinfl"
              label="rental.fields.lessorPinfl"
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <InputText
              formik={formik}
              fieldName="contractNumber"
              label="rental.fields.contractNumber"
              required
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <SelectDate
              formik={formik}
              fieldName="contractDate"
              label="rental.fields.contractDate"
              valueFormat="YYYY-MM-DDT00:00:00"
              required
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <SelectCustom
              formik={formik}
              fieldName="currencyId"
              label="rental.fields.currency"
              path={selectListEndpoints.currenciesSelectList}
              required
              search
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <SelectDate
              formik={formik}
              fieldName="startDate"
              label="rental.fields.startDate"
              valueFormat="YYYY-MM-DDT00:00:00"
              maxDate={
                formik.values.endDate ? dayjs(formik.values.endDate) : undefined
              }
              required
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
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
          <Col xs={24} md={12} lg={8}>
            <RentalAccountSelect
              formik={formik}
              fieldName="lessorPayableAccountId"
              label="rental.fields.lessorPayableAccount"
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
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

      <ContractObjectsEditor formik={formik} />

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
    </Form>
  );
}
