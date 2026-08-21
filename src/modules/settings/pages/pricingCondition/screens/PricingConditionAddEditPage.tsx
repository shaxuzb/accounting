import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import InputNumberFormat from "@/components/fields/InputNumber";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { formatDate } from "@/utils/helpers";
import type { PricingConditionForm } from "../types/form";
import { pricingConditionSchema } from "../types/schema";
import { useCreatePricingCondition } from "../hooks/useCreatePricingCondition";
import { useGetDetailPricingCondition } from "../hooks/useGetDetailPricingCondition";

const defaultValues: PricingConditionForm = {
  pricingMethodId: null,
  pricingValue: null,
  roundingMethodId: null,
  roundingPrecision: null,
  startDate: dayjs().format(formatDate),
  endDate: null,
};

interface PricingConditionAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function PricingConditionAddEditPage({
  open,
  onClose,
  id,
}: PricingConditionAddEditPageProps) {
  const { t } = useTranslation();
  const viewId = id ?? null;
  const isView = Boolean(viewId);
  const { data: condition, isLoading } = useGetDetailPricingCondition(
    viewId ?? "",
  );
  const createMutation = useCreatePricingCondition();

  const formik = useFormik<PricingConditionForm>({
    initialValues: defaultValues,
    enableReinitialize: true,
    validationSchema: pricingConditionSchema(),
    onSubmit: async (values, helpers) => {
      try {
        await createMutation.mutateAsync(values);
        toast.success(t("settings.messages.created"));
        helpers.resetForm();
        onClose();
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });

  useEffect(() => {
    if (condition && isView) {
      formik.setValues({
        pricingMethodId: condition.pricingMethodId ?? null,
        pricingValue: condition.pricingValue ?? null,
        roundingMethodId: condition.roundingMethodId ?? null,
        roundingPrecision: condition.roundingPrecision ?? null,
        startDate: condition.startDate ?? dayjs().format(formatDate),
        endDate: condition.endDate ?? null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition, isView]);

  return (
    <Modal
      mask={{ closable: false }}
      title={
        isView
          ? t("settings.form.viewPricingCondition")
          : t("settings.form.createPricingCondition")
      }
      open={open}
      onCancel={() => {
        formik.resetForm();
        onClose();
      }}
      footer={null}
      centered
      width={640}
    >
      <Spin spinning={isLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="pricingMethodId"
                label="settings.fields.pricingMethod"
                path={selectListEndpoints.pricingMethodsSelectList}
                disabled={isView}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="roundingMethodId"
                label="settings.fields.roundingMethod"
                path={selectListEndpoints.priceRoundingMethodsSelectList}
                disabled={isView}
              />
            </Col>
            <Col span={12}>
              <InputNumberFormat
                formik={formik}
                fieldName="pricingValue"
                label="settings.fields.pricingValue"
                min={0}
                disabled={isView}
              />
            </Col>

            <Col span={12}>
              <InputNumberFormat
                formik={formik}
                fieldName="roundingPrecision"
                label="settings.fields.roundingPrecision"
                min={0}
                disabled={isView}
              />
            </Col>
            <Col span={12}>
              <SelectDate
                formik={formik}
                fieldName="startDate"
                label="settings.fields.startDate"
                disabled={isView}
              />
            </Col>
            <Col span={12}>
              <SelectDate
                formik={formik}
                fieldName="endDate"
                label="settings.fields.endDate"
                disabled={isView}
              />
            </Col>
          </Row>

          {!isView && (
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              className="h-12 rounded-xl bg-blue-600! hover:bg-blue-700! font-semibold text-base"
              loading={createMutation.isPending}
            >
              {t("common.submit")}
            </Button>
          )}
        </Form>
      </Spin>
    </Modal>
  );
}
