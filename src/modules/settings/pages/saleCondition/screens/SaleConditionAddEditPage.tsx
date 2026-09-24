import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import { Button, Col, Form, Modal, Row } from "antd";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { formatDate } from "@/utils/helpers";
import type { SaleConditionForm } from "../types/form";
import { saleConditionSchema } from "../types/schema";
import { useCreateSaleCondition } from "../hooks/useCreateSaleCondition";

const createDefaultValues = (): SaleConditionForm => ({
  costingMethodId: null,
  vatRateId: null,
  startDate: dayjs().format(formatDate),
  endDate: null,
});

interface SaleConditionAddEditPageProps {
  open: boolean;
  onClose: () => void;
}

export default function SaleConditionAddEditPage({
  open,
  onClose,
}: SaleConditionAddEditPageProps) {
  // Taken once when the form opens; the factory reads the clock.
  const [openedDefaults] = useState(createDefaultValues);
  const { t } = useTranslation();
  const createMutation = useCreateSaleCondition();

  const formik = useFormik<SaleConditionForm>({
    initialValues: openedDefaults,
    enableReinitialize: true,
    validationSchema: saleConditionSchema(),
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

  return (
    <Modal
      mask={{ closable: false }}
      title={t("settings.form.createSaleCondition")}
      open={open}
      onCancel={() => {
        formik.resetForm();
        onClose();
      }}
      footer={null}
      centered
      width={640}
    >
      <Form layout="vertical" onFinish={formik.handleSubmit}>
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <SelectCustom
              formik={formik}
              fieldName="costingMethodId"
              label="settings.fields.costingMethod"
              path={selectListEndpoints.costingMethodsSelectList}
            />
          </Col>
          <Col span={12}>
            <SelectCustom
              formik={formik}
              fieldName="vatRateId"
              label="settings.fields.vatRate"
              path={selectListEndpoints.vatRatesSelectList}
            />
          </Col>
          <Col span={12}>
            <SelectDate
              formik={formik}
              fieldName="startDate"
              label="settings.fields.startDate"
            />
          </Col>
          <Col span={12}>
            <SelectDate
              formik={formik}
              fieldName="endDate"
              label="settings.fields.endDate"
            />
          </Col>
        </Row>

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
      </Form>
    </Modal>
  );
}
