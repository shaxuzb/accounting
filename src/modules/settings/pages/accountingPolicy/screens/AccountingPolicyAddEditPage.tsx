import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import InputText from "@/components/fields/InputText";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import SelectStatic from "@/components/fields/SelectStatic";
import SwitchField from "@/components/fields/SwitchField";
import { selectListEndpoints } from "@/shared/constants/selectLists";
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

const createDefaultValues = (): AccountingPolicyForm => ({
  inventoryValuationMethod: "FIFO",
  baseCurrencyId: 1,
  vatPayer: true,
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
        title: "Accounting policy’ni yangilaysizmi?",
        content:
          "Yangi policy version yaratiladi. Mavjud hujjatlar qayta hisoblanmaydi.",
        okText: "Tasdiqlash",
        cancelText: "Bekor qilish",
        onOk: async () => {
          try {
            await updateMutation.mutateAsync(
              buildAccountingPolicyUpdatePayload(values),
            );
            toast.success("Accounting policy yangilandi");
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
    if (data && open) setValues(buildAccountingPolicyFormValues(data));
  }, [data, open, setValues]);

  if (!open) return null;

  const isSubmitting = updateMutation.isPending;

  return (
    <Modal
      maskClosable={false}
      title="Accounting Policy’ni tahrirlash"
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
            <Col span={12}>
              <SelectStatic
                formik={formik}
                fieldName="inventoryValuationMethod"
                label="Accounting valuation method"
                options={[{ value: "FIFO", label: "FIFO" }]}
              />
            </Col>
            <Col span={12}>
              <SelectStatic
                formik={formik}
                fieldName="baseCurrencyId"
                label="Base currency ID"
                options={[{ value: 1, label: "UZS" }]}
              />
            </Col>
            <Col span={12}>
              <SwitchField
                formik={formik}
                fieldName="vatPayer"
                label="VAT payer"
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="taxTypeId"
                label="Tax type"
                path={selectListEndpoints.taxTypesSelectList}
                clearable
              />
            </Col>
            <Col span={12}>
              <SelectStatic
                formik={formik}
                fieldName="vatTaxPeriod"
                label="VAT period"
                options={[{ value: "MONTH", label: "Oyma-oy" }]}
              />
            </Col>
            <Col span={12}>
              <SelectStatic
                formik={formik}
                fieldName="vatBaseMoment"
                label="VAT base moment"
                options={[{ value: "SHIPMENT", label: "Yuklash vaqtida" }]}
              />
            </Col>
            <Col span={12}>
              <SelectDate
                formik={formik}
                fieldName="effectiveFrom"
                label="Effective from"
                valueFormat="YYYY-MM-DD"
                required
              />
            </Col>
            <Col span={12}>
              <SelectDate
                formik={formik}
                fieldName="effectiveTo"
                label="Effective to"
                valueFormat="YYYY-MM-DD"
                clearable
              />
            </Col>
            <Col span={12}>
              <SwitchField
                formik={formik}
                fieldName="productionEnabled"
                label="Production enabled"
              />
            </Col>
            <Col span={12}>
              <SwitchField
                formik={formik}
                fieldName="foreignCurrencyEnabled"
                label="Foreign currency enabled"
              />
            </Col>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="costAllocationMethod"
                label="Cost allocation method"
              />
            </Col>
            <Col span={12}>
              <SelectStatic
                formik={formik}
                fieldName="closedPeriodPolicy"
                label="Closed-period policy"
                options={[
                  {
                    value: "PROTECT_CLOSED_PERIOD",
                    label: "Yopiq davrni himoyalash",
                  },
                ]}
              />
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
