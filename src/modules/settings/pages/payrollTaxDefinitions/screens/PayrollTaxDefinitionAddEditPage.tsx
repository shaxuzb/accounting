import InputNumber from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import SelectStatic from "@/components/fields/SelectStatic";
import {
  taxBaseTypeOptions,
  taxTypeOptions,
} from "@/modules/payroll/constants/options";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Alert, Button, Col, Form, Modal, Row, Spin } from "antd";
import { useFormik } from "formik";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  useCreatePayrollTaxDefinition,
  useGetDetailPayrollTaxDefinition,
  useGetListPayrollTaxDefinitions,
  useUpdatePayrollTaxDefinition,
} from "../hooks";
import type { PayrollTaxDefinitionForm } from "../types/form";
import { payrollTaxDefinitionSchema } from "../types/schema";

const defaultValues: PayrollTaxDefinitionForm = {
  code: "",
  name: "",
  taxType: "WITHHOLDING",
  baseType: "TAXABLE_EARNINGS",
  rate: null,
  exemptionAmount: null,
  limitAmount: null,
  reducesTaxCode: null,
  liabilityAccountId: null,
  effectiveFrom: "",
  effectiveTo: null,
};

interface Props {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function PayrollTaxDefinitionAddEditPage({
  open,
  onClose,
  id,
}: Props) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);

  const { data: definition, isFetching } =
    useGetDetailPayrollTaxDefinition(editId);
  const createMutation = useCreatePayrollTaxDefinition();
  const updateMutation = useUpdatePayrollTaxDefinition();

  const formik = useFormik<PayrollTaxDefinitionForm>({
    initialValues: defaultValues,
    enableReinitialize: false,
    validationSchema: payrollTaxDefinitionSchema,
    onSubmit: async (values, helpers) => {
      const payload: PayrollTaxDefinitionForm = {
        ...values,
        exemptionAmount: values.exemptionAmount ?? null,
        limitAmount: values.limitAmount ?? null,
        reducesTaxCode: values.reducesTaxCode || null,
        effectiveTo: values.effectiveTo || null,
      };
      try {
        if (isEdit && editId) {
          await updateMutation.mutateAsync({ id: editId, payload });
          toast.success(t("settings.messages.updated"));
        } else {
          await createMutation.mutateAsync(payload);
          toast.success(t("settings.messages.created"));
        }
        helpers.resetForm();
        onClose();
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const { resetForm, setValues } = formik;

  useEffect(() => {
    if (!open) return;
    if (isEdit && definition) {
      void setValues({
        code: definition.code ?? "",
        name: definition.name ?? "",
        taxType: definition.taxType ?? "WITHHOLDING",
        baseType: definition.baseType ?? "TAXABLE_EARNINGS",
        rate: definition.rate ?? null,
        exemptionAmount: definition.exemptionAmount ?? null,
        limitAmount: definition.limitAmount ?? null,
        reducesTaxCode: definition.reducesTaxCode ?? null,
        liabilityAccountId: definition.liabilityAccountId ?? null,
        effectiveFrom: definition.effectiveFrom ?? "",
        effectiveTo: definition.effectiveTo ?? null,
      });
      return;
    }
    if (!isEdit) resetForm({ values: defaultValues });
  }, [open, isEdit, definition, resetForm, setValues]);

  // ИНПС is financed out of НДФЛ, so the target has to be another rule of the same kind:
  // offsetting a withholding against an employer tax would move the burden between the
  // employee and the company.
  const { data: definitionList } = useGetListPayrollTaxDefinitions();
  const reducibleTaxOptions = (definitionList?.items ?? [])
    .filter(
      (item) =>
        item.id !== editId &&
        item.taxType === formik.values.taxType &&
        !item.reducesTaxCode,
    )
    .map((item) => ({ value: item.code, label: `${item.code} — ${item.name}` }));

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleClose = () => {
    resetForm({ values: defaultValues });
    onClose();
  };

  return (
    <Modal
      maskClosable={false}
      title={
        isEdit
          ? t("payroll.taxes.editTitle")
          : t("payroll.taxes.createTitle")
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={700}
      destroyOnHidden
    >
      <Spin spinning={isEdit && isFetching}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={16}>
              <InputText
                formik={formik}
                fieldName="name"
                label="payroll.fields.taxName"
              />
            </Col>
            <Col xs={24} md={8}>
              <InputText
                formik={formik}
                fieldName="code"
                label="payroll.fields.taxCode"
              />
            </Col>

            <Col xs={24} md={12}>
              <SelectStatic
                formik={formik}
                fieldName="taxType"
                label="payroll.fields.taxType"
                options={taxTypeOptions}
                required
                marginBottom="mb-4"
              />
            </Col>
            <Col xs={24} md={12}>
              <SelectStatic
                formik={formik}
                fieldName="baseType"
                label="payroll.fields.taxBaseType"
                options={taxBaseTypeOptions}
                required
                marginBottom="mb-4"
              />
            </Col>

            <Col xs={24} md={12}>
              <InputNumber
                formik={formik}
                fieldName="rate"
                label="payroll.fields.taxRate"
                min={0}
                max={100}
                precision={4}
              />
            </Col>
            <Col xs={24} md={12}>
              <SelectCustom
                formik={formik}
                fieldName="liabilityAccountId"
                label="payroll.fields.taxLiabilityAccount"
                path={selectListEndpoints.chartAccountsSelectList}
                displayConfig={chartAccountSelectDisplayConfig}
                search
                required
                marginBottom="mb-4"
              />
            </Col>

            <Col xs={24} md={12}>
              <InputNumber
                formik={formik}
                fieldName="exemptionAmount"
                label="payroll.fields.taxExemptionAmount"
                min={0}
                precision={2}
              />
            </Col>
            <Col xs={24} md={12}>
              <InputNumber
                formik={formik}
                fieldName="limitAmount"
                label="payroll.fields.taxLimitAmount"
                min={0}
                precision={2}
              />
            </Col>

            <Col xs={24}>
              <SelectStatic
                formik={formik}
                fieldName="reducesTaxCode"
                label="payroll.fields.reducesTaxCode"
                options={reducibleTaxOptions}
                clearable
                disabled={reducibleTaxOptions.length === 0}
                marginBottom="mb-4"
              />
            </Col>

            <Col xs={24} md={12}>
              <SelectDate
                formik={formik}
                fieldName="effectiveFrom"
                label="payroll.fields.effectiveFrom"
                valueFormat="YYYY-MM-DD"
                required
              />
            </Col>
            <Col xs={24} md={12}>
              <SelectDate
                formik={formik}
                fieldName="effectiveTo"
                label="payroll.fields.effectiveTo"
                valueFormat="YYYY-MM-DD"
                clearable
              />
            </Col>
          </Row>

          <Alert
            type="info"
            showIcon
            className="mb-3"
            message={
              formik.values.reducesTaxCode
                ? t("payroll.taxes.reducesHint", {
                    code: formik.values.reducesTaxCode,
                  })
                : t(
                    formik.values.taxType === "EMPLOYER"
                      ? "payroll.taxes.employerHint"
                      : "payroll.taxes.withholdingHint",
                  )
            }
          />

          <div className="mt-3 flex justify-end gap-2">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isSubmitting}
              className="w-full rounded-xl bg-blue-600! font-semibold text-base hover:bg-blue-700!"
            >
              {t("common.save")}
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
}
