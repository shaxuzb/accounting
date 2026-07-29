import InputNumber from "@/components/fields/InputNumber";
import SelectStatic from "@/components/fields/SelectStatic";
import { monthOptions } from "@/modules/payroll/constants/options";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Alert, Button, Col, Form, Modal, Row } from "antd";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useCreatePayrollPeriod } from "../hooks";
import type { PayrollPeriodForm } from "../types/form";
import { payrollPeriodSchema } from "../types/schema";

/** Oyning ish kunlarini taxminiy hisoblaydi (dam olish kunlarisiz). */
const estimateWorkDays = (year: number, month: number) => {
  const start = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
  const daysInMonth = start.daysInMonth();
  let workDays = 0;
  for (let day = 0; day < daysInMonth; day += 1) {
    const weekday = start.add(day, "day").day();
    if (weekday !== 0 && weekday !== 6) workDays += 1;
  }
  return workDays;
};

const now = dayjs();

const defaultValues: PayrollPeriodForm = {
  year: now.year(),
  month: now.month() + 1,
  normWorkDays: estimateWorkDays(now.year(), now.month() + 1),
  normWorkHours: estimateWorkDays(now.year(), now.month() + 1) * 8,
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PayrollPeriodModal({ open, onClose }: Props) {
  const { t } = useTranslation();
  const createMutation = useCreatePayrollPeriod();

  const formik = useFormik<PayrollPeriodForm>({
    initialValues: defaultValues,
    validationSchema: payrollPeriodSchema,
    onSubmit: async (values, helpers) => {
      try {
        await createMutation.mutateAsync(values);
        toast.success(t("payroll.messages.periodCreated"));
        helpers.resetForm({ values: defaultValues });
        onClose();
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const { resetForm, setFieldValue } = formik;

  useEffect(() => {
    if (open) resetForm({ values: defaultValues });
  }, [open, resetForm]);

  /** Yil yoki oy o'zgarganda me'yorni avtomatik taklif qiladi. */
  const suggestNorms = (year: number | null, month: number | null) => {
    if (!year || !month) return;
    const days = estimateWorkDays(year, month);
    void setFieldValue("normWorkDays", days, false);
    void setFieldValue("normWorkHours", days * 8, false);
  };

  const handleClose = () => {
    resetForm({ values: defaultValues });
    onClose();
  };

  return (
    <Modal
      title={t("payroll.periods.createTitle")}
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={560}
      destroyOnHidden
    >
      <Form layout="vertical" onFinish={formik.handleSubmit}>
        <Alert
          type="info"
          showIcon
          className="mb-4"
          message={t("payroll.periods.createHint")}
        />
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <InputNumber
              formik={formik}
              fieldName="year"
              label="payroll.fields.year"
              min={2000}
              max={2200}
              precision={0}
              onValueChange={(value) => {
                void setFieldValue("year", value, true);
                suggestNorms(value, formik.values.month);
              }}
              value={formik.values.year}
            />
          </Col>
          <Col xs={24} md={12}>
            <SelectStatic
              formik={formik}
              fieldName="month"
              label="payroll.fields.month"
              options={monthOptions}
              required
              marginBottom="mb-4"
              onChange={(value) =>
                suggestNorms(formik.values.year, Number(value))
              }
            />
          </Col>
          <Col xs={24} md={12}>
            <InputNumber
              formik={formik}
              fieldName="normWorkDays"
              label="payroll.fields.normWorkDays"
              min={0}
              max={31}
              precision={0}
            />
          </Col>
          <Col xs={24} md={12}>
            <InputNumber
              formik={formik}
              fieldName="normWorkHours"
              label="payroll.fields.normWorkHours"
              min={0}
              precision={1}
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
            loading={createMutation.isPending}
            className="h-11! min-w-40 font-semibold"
          >
            {t("common.create")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
