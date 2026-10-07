import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SelectDate from "@/components/fields/SelectDate";
import SwitchField from "@/components/fields/SwitchField";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { accountingPolicyPermissions } from "../constants/permissions";
import {
  useGetCurrentAccountingPolicy,
  useUpdateAccountingPolicy,
} from "../hooks";
import {
  buildAccountingPolicyFormValues,
  buildAccountingPolicyUpdatePayload,
} from "../utils/payload";
import { accountingPolicySchema } from "../types/schema";
import type { AccountingPolicyForm } from "../types/form";
import PayrollTaxRegimeField from "../components/PayrollTaxRegimeField";

const createDefaultValues = (): AccountingPolicyForm => ({
  inventoryValuationMethod: "FIFO",
  baseCurrencyId: 1,
  vatPayer: true,
  payrollTaxRegimeId: null,
  taxTypeId: null,
  vatTaxPeriod: "MONTH",
  vatBaseMoment: "SHIPMENT",
  effectiveFrom: dayjs().format("YYYY-MM-DD"),
  effectiveTo: null,
  productionEnabled: null,
  foreignCurrencyEnabled: null,
  costAllocationMethod: null,
  closedPeriodPolicy: "PROTECT_CLOSED_PERIOD",
});

interface AccountingPolicyAddEditPageProps {
  open: boolean;
  onClose: () => void;
  effectiveOn: string;
}

export default function AccountingPolicyAddEditPage({
  open,
  onClose,
  effectiveOn,
}: AccountingPolicyAddEditPageProps) {
  // Taken once when the form opens; the factory reads the clock.
  const [openedDefaults] = useState(createDefaultValues);
  const { t } = useTranslation();
  const { data, isLoading } = useGetCurrentAccountingPolicy({
    effectiveOn,
    enabled: open,
  });
  const updateMutation = useUpdateAccountingPolicy();

  const formik = useFormik<AccountingPolicyForm>({
    initialValues: openedDefaults,
    enableReinitialize: true,
    validationSchema: accountingPolicySchema,
    onSubmit: async (values, helpers) => {
      Modal.confirm({
        title: t("accountingPolicy.form.confirmTitle"),
        content: t("accountingPolicy.form.confirmText"),
        okText: t("common.confirm"),
        cancelText: t("common.cancel"),
        onOk: async () => {
          try {
            await updateMutation.mutateAsync(
              buildAccountingPolicyUpdatePayload(values),
            );
            toast.success(t("accountingPolicy.form.saved"));
            helpers.resetForm();
            onClose();
          } catch (error) {
            errorHandlers(error);
            throw error;
          }
        },
      });
    },
  });
  const { setValues, submitForm } = formik;

  useEffect(() => {
    if (data && open) setValues(buildAccountingPolicyFormValues(data, dayjs().format("YYYY-MM-DD")));
  }, [data, open, setValues]);

  if (!open) return null;

  const isSubmitting = updateMutation.isPending;

  return (
    <Modal
      maskClosable={false}
      title={t("accountingPolicy.form.title")}
      open={open}
      onCancel={() => {
        formik.resetForm();
        onClose();
      }}
      footer={null}
      centered
      width={760}
      destroyOnHidden
    >
      <Spin spinning={isLoading}>
        <Form layout="vertical" onFinish={() => void submitForm()}>
          <Row gutter={[16, 8]}>
            <Col span={24}>
              <SwitchField
                formik={formik}
                fieldName="vatPayer"
                label={t("accountingPolicy.form.vatPayer")}
              />
              <div className="mb-3 text-xs text-secondary-text">
                {t("accountingPolicy.form.vatPayerHint")}
              </div>
            </Col>
            <Col span={24}>
              <PayrollTaxRegimeField
                value={formik.values.payrollTaxRegimeId}
                onChange={(value) => void formik.setFieldValue("payrollTaxRegimeId", value)}
                date={formik.values.effectiveFrom || dayjs().format("YYYY-MM-DD")}
              />
            </Col>
            <Col span={12}>
              <SelectDate
                formik={formik}
                fieldName="effectiveFrom"
                label={t("accountingPolicy.form.effectiveFrom")}
                valueFormat="YYYY-MM-DD"
                required
              />
            </Col>
            <Col span={12}>
              <SelectDate
                formik={formik}
                fieldName="effectiveTo"
                label={t("accountingPolicy.form.effectiveTo")}
                valueFormat="YYYY-MM-DD"
                clearable
              />
            </Col>
            <Col span={24}>
              <div className="mb-4 rounded-lg border border-border p-3 text-sm text-secondary-text">
                {t("accountingPolicy.form.fixedRules")}
              </div>
            </Col>
          </Row>

          <PermissionCard permission={accountingPolicyPermissions.update}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              className="h-12 rounded-xl bg-blue-600! hover:bg-blue-700! font-semibold text-base"
              loading={isSubmitting}
              disabled={!formik.isValidating && !formik.isValid}
            >
              {t("common.submit")}
            </Button>
          </PermissionCard>
        </Form>
      </Spin>
    </Modal>
  );
}
