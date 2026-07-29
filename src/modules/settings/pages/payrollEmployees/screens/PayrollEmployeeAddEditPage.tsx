import InputPhoneNumber from "@/components/fields/InputPhoneNumber";
import InputText from "@/components/fields/InputText";
import SelectDate from "@/components/fields/SelectDate";
import { emptyToNull, normalizePhone } from "@/modules/payroll/utils/format";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Alert, Button, Col, Divider, Form, Modal, Row, Spin } from "antd";
import { useFormik } from "formik";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import EmploymentFormFields from "../components/EmploymentFormFields";
import {
  useCreatePayrollEmployee,
  useGetDetailPayrollEmployee,
  useUpdatePayrollEmployee,
} from "../hooks";
import type {
  PayrollEmployeeForm,
  PayrollEmployeeMainForm,
} from "../types/form";
import { employeeCreateSchema, employeeMainSchema } from "../types/schema";

const defaultValues: PayrollEmployeeForm = {
  employeeNumber: "",
  pinfl: null,
  tin: null,
  firstName: "",
  lastName: "",
  middleName: null,
  birthDate: null,
  phoneNumber: null,
  email: null,
  bankAccountNumber: null,
  employment: {
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
  },
};

interface Props {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

/**
 * Xodim kartochkasi.
 * Yaratishda birinchi ish sharti ham shu oynada to'ldiriladi,
 * tahrirlashda esa faqat asosiy ma'lumotlar yangilanadi.
 */
export default function PayrollEmployeeAddEditPage({
  open,
  onClose,
  id,
}: Props) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);

  const { data: employee, isFetching } = useGetDetailPayrollEmployee(editId);
  const createMutation = useCreatePayrollEmployee();
  const updateMutation = useUpdatePayrollEmployee();

  const formik = useFormik<PayrollEmployeeForm>({
    initialValues: defaultValues,
    enableReinitialize: false,
    validationSchema: isEdit ? employeeMainSchema : employeeCreateSchema,
    onSubmit: async (values, helpers) => {
      const main: PayrollEmployeeMainForm = {
        employeeNumber: values.employeeNumber.trim(),
        pinfl: emptyToNull(values.pinfl)?.replace(/\D/g, "") ?? null,
        tin: emptyToNull(values.tin),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        middleName: emptyToNull(values.middleName),
        birthDate: values.birthDate || null,
        phoneNumber: normalizePhone(values.phoneNumber),
        email: emptyToNull(values.email),
        bankAccountNumber: emptyToNull(values.bankAccountNumber),
      };

      try {
        if (isEdit && editId) {
          await updateMutation.mutateAsync({ id: editId, payload: main });
          toast.success(t("settings.messages.updated"));
        } else {
          await createMutation.mutateAsync({
            ...main,
            employment: {
              ...values.employment,
              endDate: values.employment.endDate || null,
            },
          });
          toast.success(t("settings.messages.created"));
        }
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
    if (isEdit && employee) {
      void setValues({
        ...defaultValues,
        employeeNumber: employee.employeeNumber ?? "",
        pinfl: employee.pinfl ?? null,
        tin: employee.tin ?? null,
        firstName: employee.firstName ?? "",
        lastName: employee.lastName ?? "",
        middleName: employee.middleName ?? null,
        birthDate: employee.birthDate ?? null,
        phoneNumber: employee.phoneNumber ?? null,
        email: employee.email ?? null,
        bankAccountNumber: employee.bankAccountNumber ?? null,
      });
      return;
    }
    if (!isEdit) resetForm({ values: defaultValues });
  }, [open, isEdit, employee, resetForm, setValues]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleClose = () => {
    resetForm({ values: defaultValues });
    onClose();
  };

  return (
    <Modal
      title={
        isEdit
          ? t("payroll.employees.editTitle")
          : t("payroll.employees.createTitle")
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={860}
      destroyOnHidden
    >
      <Spin spinning={isEdit && isFetching}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <InputText
                formik={formik}
                fieldName="employeeNumber"
                label="payroll.fields.employeeNumber"
              />
            </Col>
            <Col xs={24} md={8}>
              <InputText
                formik={formik}
                fieldName="lastName"
                label="settings.fields.lastName"
              />
            </Col>
            <Col xs={24} md={8}>
              <InputText
                formik={formik}
                fieldName="firstName"
                label="settings.fields.firstName"
              />
            </Col>

            <Col xs={24} md={8}>
              <InputText
                formik={formik}
                fieldName="middleName"
                label="payroll.fields.middleName"
              />
            </Col>
            <Col xs={24} md={8}>
              <InputText
                formik={formik}
                fieldName="pinfl"
                label="payroll.fields.pinfl"
              />
            </Col>
            <Col xs={24} md={8}>
              <InputText
                formik={formik}
                fieldName="tin"
                label="payroll.fields.tin"
              />
            </Col>

            <Col xs={24} md={8}>
              <SelectDate
                formik={formik}
                fieldName="birthDate"
                label="payroll.fields.birthDate"
                valueFormat="YYYY-MM-DD"
                clearable
              />
            </Col>
            <Col xs={24} md={8}>
              <InputPhoneNumber
                formik={formik}
                fieldName="phoneNumber"
                label="settings.fields.phoneNumber"
              />
            </Col>
            <Col xs={24} md={8}>
              <InputText
                formik={formik}
                fieldName="email"
                label="settings.fields.email"
              />
            </Col>

            <Col xs={24}>
              <InputText
                formik={formik}
                fieldName="bankAccountNumber"
                label="payroll.fields.bankAccountNumber"
              />
            </Col>
          </Row>

          {!isEdit && (
            <>
              <Divider titlePlacement="start" className="text-sm!">
                {t("payroll.employees.employmentSection")}
              </Divider>
              <Alert
                type="info"
                showIcon
                className="mb-4"
                message={t("payroll.employees.employmentHint")}
              />
              <EmploymentFormFields formik={formik} prefix="employment." />
            </>
          )}

          {isEdit && (
            <Alert
              type="info"
              showIcon
              className="mb-4"
              message={t("payroll.employees.editEmploymentHint")}
            />
          )}

          <div className="flex justify-end gap-2">
            <Button onClick={handleClose} size="large" className="h-11!">
              {t("common.cancel")}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isSubmitting}
              className="h-11! min-w-40 font-semibold"
            >
              {t("common.save")}
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
}
