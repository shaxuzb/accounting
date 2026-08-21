import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Alert, Button, Form, Modal } from "antd";
import { useFormik } from "formik";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useSavePayrollEmployment } from "../hooks";
import type { PayrollEmploymentForm } from "../types/form";
import { employmentSchema } from "../types/schema";
import type { PayrollEmployment } from "../types/type";
import EmploymentFormFields from "./EmploymentFormFields";

const defaultValues: PayrollEmploymentForm = {
  departmentId: null,
  positionId: null,
  employmentType: "PRIMARY",
  startDate: "",
  endDate: null,
  monthlySalary: null,
  employmentRate: 1,
  weeklyHours: 40,
  currencyId: null,
  expenseAccountId: null,
};

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId: string | number;
  employment?: PayrollEmployment | null;
}

export default function EmployeeEmploymentModal({
  open,
  onClose,
  employeeId,
  employment,
}: Props) {
  const { t } = useTranslation();
  const isEdit = Boolean(employment?.id);
  const saveMutation = useSavePayrollEmployment(employeeId);

  const formik = useFormik<PayrollEmploymentForm>({
    initialValues: defaultValues,
    validationSchema: employmentSchema,
    onSubmit: async (values, helpers) => {
      try {
        await saveMutation.mutateAsync({
          employmentId: employment?.id ?? null,
          payload: { ...values, endDate: values.endDate || null },
        });
        toast.success(
          isEdit
            ? t("payroll.messages.employmentUpdated")
            : t("payroll.messages.employmentCreated"),
        );
        helpers.resetForm({ values: defaultValues });
        onClose();
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const { resetForm, setValues } = formik;

  useEffect(() => {
    if (!open) return;
    if (employment) {
      void setValues({
        departmentId: employment.departmentId ?? null,
        positionId: employment.positionId ?? null,
        employmentType: employment.employmentType ?? "PRIMARY",
        startDate: employment.startDate ?? "",
        endDate: employment.endDate ?? null,
        monthlySalary: employment.monthlySalary ?? null,
        employmentRate: employment.employmentRate ?? 1,
        weeklyHours: employment.weeklyHours ?? 40,
        currencyId: employment.currencyId ?? null,
        expenseAccountId: employment.expenseAccountId ?? null,
      });
      return;
    }
    resetForm({ values: defaultValues });
  }, [open, employment, resetForm, setValues]);

  const handleClose = () => {
    resetForm({ values: defaultValues });
    onClose();
  };

  return (
    <Modal maskClosable={false}
      title={
        isEdit
          ? t("payroll.employments.editTitle")
          : t("payroll.employments.createTitle")
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={820}
      destroyOnHidden
    >
      <Form layout="vertical" onFinish={formik.handleSubmit}>
        {!isEdit && (
          <Alert
            type="info"
            showIcon
            className="mb-4"
            message={t("payroll.employments.createHint")}
          />
        )}
        <EmploymentFormFields formik={formik} />
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose} size="large" className="h-11!">
            {t("common.cancel")}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={saveMutation.isPending}
            className="h-11! min-w-40 font-semibold"
          >
            {t("common.save")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
