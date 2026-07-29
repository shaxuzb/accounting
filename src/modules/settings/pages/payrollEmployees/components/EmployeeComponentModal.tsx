import InputNumber from "@/components/fields/InputNumber";
import InputTextArea from "@/components/fields/InputTextArea";
import SelectDate from "@/components/fields/SelectDate";
import PayrollComponentSelect from "@/modules/payroll/components/PayrollComponentSelect";
import { usePayrollComponentLookup } from "@/modules/payroll/hooks";
import {
  methodUsesAmount,
  methodUsesRate,
} from "@/modules/payroll/constants/options";
import { emptyToNull } from "@/modules/payroll/utils/format";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Alert, Button, Col, Form, Modal, Row } from "antd";
import { useFormik } from "formik";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAssignPayrollComponent } from "../hooks";
import type { PayrollEmployeeComponentForm } from "../types/form";
import { employeeComponentSchema } from "../types/schema";

const defaultValues: PayrollEmployeeComponentForm = {
  componentId: null,
  amount: null,
  rate: null,
  effectiveFrom: "",
  effectiveTo: null,
  note: null,
};

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId: string | number;
}

export default function EmployeeComponentModal({
  open,
  onClose,
  employeeId,
}: Props) {
  const { t } = useTranslation();
  const assignMutation = useAssignPayrollComponent(employeeId);
  const { data: components } = usePayrollComponentLookup();

  const formik = useFormik<PayrollEmployeeComponentForm>({
    initialValues: defaultValues,
    validationSchema: employeeComponentSchema,
    onSubmit: async (values, helpers) => {
      const method = (components ?? []).find(
        (component) => component.id === values.componentId,
      )?.calculationMethod;
      try {
        await assignMutation.mutateAsync({
          ...values,
          amount: methodUsesAmount(method) ? values.amount : null,
          rate: methodUsesRate(method) ? values.rate : null,
          effectiveTo: values.effectiveTo || null,
          note: emptyToNull(values.note),
        });
        toast.success(t("payroll.messages.componentAssigned"));
        helpers.resetForm({ values: defaultValues });
        onClose();
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const { resetForm } = formik;

  useEffect(() => {
    if (open) resetForm({ values: defaultValues });
  }, [open, resetForm]);

  const selected = useMemo(
    () =>
      (components ?? []).find(
        (component) => component.id === formik.values.componentId,
      ),
    [components, formik.values.componentId],
  );

  const usesAmount = methodUsesAmount(selected?.calculationMethod);
  const usesRate = methodUsesRate(selected?.calculationMethod);

  const handleClose = () => {
    resetForm({ values: defaultValues });
    onClose();
  };

  return (
    <Modal
      title={t("payroll.employees.assignComponentTitle")}
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={620}
      destroyOnHidden
    >
      <Form layout="vertical" onFinish={formik.handleSubmit}>
        <Alert
          type="info"
          showIcon
          className="mb-4"
          message={t("payroll.employees.assignComponentHint")}
        />

        <PayrollComponentSelect
          formik={formik}
          fieldName="componentId"
          required
          onChange={() => {
            void formik.setFieldValue("amount", null, false);
            void formik.setFieldValue("rate", null, false);
          }}
        />

        {selected && (
          <div className="mb-4 rounded-lg border border-border px-3 py-2 text-xs text-secondary-text">
            {t("payroll.fields.calculationMethod")}:{" "}
            <span className="font-medium text-text">
              {t(
                `payroll.enums.calculationMethod.${selected.calculationMethod}`,
                { defaultValue: selected.calculationMethod },
              )}
            </span>
          </div>
        )}

        <Row gutter={[16, 0]}>
          {usesAmount && (
            <Col xs={24} md={12}>
              <InputNumber
                formik={formik}
                fieldName="amount"
                label="payroll.fields.amount"
                min={0}
                precision={2}
              />
            </Col>
          )}
          {usesRate && (
            <Col xs={24} md={12}>
              <InputNumber
                formik={formik}
                fieldName="rate"
                label="payroll.fields.rate"
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
          <Col span={24}>
            <InputTextArea
              formik={formik}
              fieldName="note"
              label="payroll.fields.note"
            />
          </Col>
        </Row>

        <div className="flex justify-end gap-2">
          <Button onClick={handleClose} size="large" className="h-11!">
            {t("common.cancel")}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={assignMutation.isPending}
            className="h-11! min-w-40 font-semibold"
          >
            {t("common.save")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
