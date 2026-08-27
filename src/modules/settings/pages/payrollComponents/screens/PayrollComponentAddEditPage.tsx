import InputNumber from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import SelectStatic from "@/components/fields/SelectStatic";
import SwitchField from "@/components/fields/SwitchField";
import {
  calculationMethodOptions,
  componentTypeOptions,
  methodUsesAmount,
  methodUsesRate,
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
  useCreatePayrollComponent,
  useGetDetailPayrollComponent,
  useUpdatePayrollComponent,
} from "../hooks";
import type { PayrollComponentForm } from "../types/form";
import { payrollComponentSchema } from "../types/schema";

const defaultValues: PayrollComponentForm = {
  code: "",
  name: "",
  componentType: null,
  calculationMethod: null,
  defaultAmount: null,
  defaultRate: null,
  isMandatory: false,
  expenseAccountId: null,
  liabilityAccountId: null,
  effectiveFrom: "",
  effectiveTo: null,
  sortOrder: 10,
};

interface Props {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function PayrollComponentAddEditPage({
  open,
  onClose,
  id,
}: Props) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);

  const { data: component, isFetching } = useGetDetailPayrollComponent(editId);
  const createMutation = useCreatePayrollComponent();
  const updateMutation = useUpdatePayrollComponent();

  const formik = useFormik<PayrollComponentForm>({
    initialValues: defaultValues,
    enableReinitialize: false,
    validationSchema: payrollComponentSchema,
    onSubmit: async (values, helpers) => {
      const payload: PayrollComponentForm = {
        ...values,
        defaultAmount: methodUsesAmount(values.calculationMethod)
          ? values.defaultAmount
          : null,
        defaultRate: methodUsesRate(values.calculationMethod)
          ? values.defaultRate
          : null,
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
    if (isEdit && component) {
      void setValues({
        code: component.code ?? "",
        name: component.name ?? "",
        componentType: component.componentType ?? null,
        calculationMethod: component.calculationMethod ?? null,
        defaultAmount: component.defaultAmount ?? null,
        defaultRate: component.defaultRate ?? null,
        isMandatory: Boolean(component.isMandatory),
        expenseAccountId: component.expenseAccountId ?? null,
        liabilityAccountId: component.liabilityAccountId ?? null,
        effectiveFrom: component.effectiveFrom ?? "",
        effectiveTo: component.effectiveTo ?? null,
        sortOrder: component.sortOrder ?? 10,
      });
      return;
    }
    if (!isEdit) resetForm({ values: defaultValues });
  }, [open, isEdit, component, resetForm, setValues]);

  const method = formik.values.calculationMethod;
  const componentType = formik.values.componentType;
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
          ? t("payroll.components.editTitle")
          : t("payroll.components.createTitle")
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
          {/* <Alert
            type="info"
            showIcon
            className="mb-4"
            message={t("payroll.components.hintTitle")}
            description={t("payroll.components.hintText")}
          /> */}

          <Row gutter={[16, 0]}>
            <Col xs={24} md={16}>
              <InputText
                formik={formik}
                fieldName="name"
                label="payroll.fields.componentName"
              />
            </Col>
            <Col xs={24} md={8}>
              <InputText
                formik={formik}
                fieldName="code"
                label="payroll.fields.componentCode"
              />
            </Col>

            <Col xs={24} md={12}>
              <SelectStatic
                formik={formik}
                fieldName="componentType"
                label="payroll.fields.componentType"
                options={componentTypeOptions}
                required
                marginBottom="mb-4"
              />
            </Col>
            <Col xs={24} md={12}>
              <SelectStatic
                formik={formik}
                fieldName="calculationMethod"
                label="payroll.fields.calculationMethod"
                options={calculationMethodOptions}
                required
                marginBottom="mb-4"
                resetFields={["defaultAmount", "defaultRate"]}
              />
            </Col>

            {methodUsesAmount(method) && (
              <Col xs={24} md={12}>
                <InputNumber
                  formik={formik}
                  fieldName="defaultAmount"
                  label="payroll.fields.defaultAmount"
                  min={0}
                  precision={2}
                />
              </Col>
            )}
            {methodUsesRate(method) && (
              <Col xs={24} md={12}>
                <InputNumber
                  formik={formik}
                  fieldName="defaultRate"
                  label={
                    method === "PERCENT_OF_GROSS"
                      ? "payroll.fields.defaultRatePercent"
                      : "payroll.fields.defaultRateHourly"
                  }
                  min={0}
                  precision={2}
                />
              </Col>
            )}

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

            <Col xs={24} md={12}>
              <SelectCustom
                formik={formik}
                fieldName="expenseAccountId"
                label="payroll.fields.expenseAccount"
                path={selectListEndpoints.chartAccountsSelectList}
                displayConfig={chartAccountSelectDisplayConfig}
                search
                clearable
                marginBottom="mb-4"
              />
            </Col>
            <Col xs={24} md={12}>
              <SelectCustom
                formik={formik}
                fieldName="liabilityAccountId"
                label="payroll.fields.liabilityAccount"
                path={selectListEndpoints.chartAccountsSelectList}
                displayConfig={chartAccountSelectDisplayConfig}
                search
                clearable
                marginBottom="mb-4"
              />
            </Col>

            <Col xs={24} md={12}>
              <InputNumber
                formik={formik}
                fieldName="sortOrder"
                label="payroll.fields.sortOrder"
                min={1}
                precision={0}
              />
            </Col>
            <Col xs={24} md={12}>
              <SwitchField
                formik={formik}
                fieldName="isMandatory"
                label="payroll.fields.isMandatory"
                description="payroll.fields.isMandatoryHint"
                marginBottom="mb-4"
              />
            </Col>
          </Row>

          {componentType === "EMPLOYER_TAX" && (
            <Alert
              type="warning"
              showIcon
              message={t("payroll.components.employerTaxNote")}
            />
          )}

          <div className="flex justify-end gap-2 mt-3">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isSubmitting}
              className="w-full  rounded-xl bg-blue-600! hover:bg-blue-700! font-semibold text-base"
            >
              {t("common.save")}
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
}
